import axios from 'axios';
import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { DateTime } from 'luxon';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();

const TRAIN_API_KEY = defineSecret('TRAIN_API_KEY');
const TRAIN_API_BASE = defineSecret('TRAIN_API_BASE');
const TRAIN_STATIC_CSV_URL = defineSecret('TRAIN_STATIC_CSV_URL');
const BUS_CSV_URL = defineSecret('BUS_CSV_URL');

async function getAllDeviceTokens(): Promise<string[]> {
  const snap = await db.collection('device_tokens').get();
  return snap.docs.map((d) => (d.data().token as string)).filter(Boolean);
}

async function broadcastPush(title: string, body: string) {
  const tokens = await getAllDeviceTokens();
  if (!tokens.length) return;
  const message: admin.messaging.MulticastMessage = {
    notification: { title, body },
    tokens,
    android: { priority: 'high' },
  };
  await admin.messaging().sendEachForMulticast(message);
}

async function updateTrainStatuses(): Promise<void> {
  const apiKey = TRAIN_API_KEY.value();
  const apiBase = TRAIN_API_BASE.value() || 'https://api.example.com';

  const staticTrainsSnap = await db.collection('transport_trains').get();
  const updates: Array<Promise<FirebaseFirestore.WriteResult>> = [];

  for (const doc of staticTrainsSnap.docs) {
    const data = doc.data();
    const trainNo = data.train_no as string;

    try {
      const resp = await axios.get(`${apiBase}/live-status/${trainNo}`, {
        params: { api_key: apiKey },
        timeout: 12000,
      });

      const payload = resp.data || {};
      const estimatedArrival = payload.estimated_arrival_time || null;
      const delayMinutes = Number(payload.delay_minutes || 0);
      const lastStation = payload.last_reported_station || null;

      const previousDelay = Number(data.delay_minutes || 0);
      const becameDelayed = delayMinutes >= 10 && delayMinutes > previousDelay;

      updates.push(
        doc.ref.set(
          {
            estimated_arrival_time: estimatedArrival,
            delay_minutes: delayMinutes,
            last_reported_station: lastStation,
            last_updated: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
      );

      if (becameDelayed) {
        await broadcastPush(
          `Train ${data.train_no} delayed ${delayMinutes}m`,
          `${data.train_name} now expected at ${estimatedArrival || 'TBD'} (last: ${lastStation || '-'})`
        );
      }
    } catch (e) {
      updates.push(
        doc.ref.set(
          { last_updated: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        )
      );
    }
  }

  await Promise.all(updates);
}

async function importOrUpdateBusSchedules(): Promise<void> {
  const csvUrl = BUS_CSV_URL.value();
  const now = DateTime.now().toISO();
  if (!csvUrl) return;

  try {
    const resp = await axios.get(csvUrl, { responseType: 'text', timeout: 20000 });
    const lines = resp.data.split(/\r?\n/).filter(Boolean);
    const header = lines.shift();
    const updates: Array<Promise<FirebaseFirestore.WriteResult>> = [];

    for (const line of lines) {
      const [route_id, route_name, stop_name, arrival_time, service_days] = line.split(',').map(s => s?.trim());
      if (!route_id) continue;
      const id = `${route_id}-${stop_name}`.replace(/\s+/g, '-').toLowerCase();
      updates.push(
        db.collection('transport_buses').doc(id).set(
          {
            route_id,
            route_name,
            stop_name,
            arrival_time,
            service_days,
            last_updated: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
      );
    }

    await Promise.all(updates);
  } catch (e) {
    await db.collection('system_logs').add({
      type: 'bus_schedule_update_failed',
      at: now,
      error: (e as Error).message,
    });
  }
}

export const updateTrains = onSchedule({ schedule: 'every 3 minutes' }, async () => {
  await updateTrainStatuses();
});

export const updateBuses = onSchedule({ schedule: 'every 45 minutes' }, async () => {
  await importOrUpdateBusSchedules();
});

export const onNewsCreated = onDocumentCreated('projects/{project}/databases/{db}/documents/news/{docId}', async (event) => {
  const data = event.data?.data();
  if (!data) return;
  await broadcastPush('MyVillupuram News', String(data.title || 'New update'));
});

export const importTrains = onRequest({ cors: true }, async (req, res) => {
  const csvUrl = TRAIN_STATIC_CSV_URL.value();
  if (!csvUrl) {
    res.status(400).json({ error: 'TRAIN_STATIC_CSV_URL not set' });
    return;
  }
  try {
    const resp = await axios.get(csvUrl, { responseType: 'text', timeout: 30000 });
    const lines = resp.data.split(/\r?\n/).filter(Boolean);
    const header = lines.shift();
    const batch = db.batch();
    let count = 0;
    for (const line of lines) {
      const [train_no, train_name, scheduled_arrival, scheduled_departure] = line.split(',').map(s => s?.trim());
      if (!train_no) continue;
      const id = String(train_no);
      const ref = db.collection('transport_trains').doc(id);
      batch.set(ref, {
        train_no,
        train_name,
        scheduled_arrival,
        scheduled_departure,
        last_updated: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      count++;
    }
    await batch.commit();
    res.json({ imported: count });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});