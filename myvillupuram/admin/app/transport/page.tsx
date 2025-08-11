'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Train { id?: string; train_no: string; train_name: string; scheduled_arrival: string; scheduled_departure: string; last_reported_station?: string; estimated_arrival_time?: string; delay_minutes?: number; last_updated?: any }
interface Bus { id?: string; route_id: string; route_name: string; stop_name: string; arrival_time: string; service_days: string; last_updated?: any }

export default function TransportPage() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    const q1 = query(collection(db, 'transport_trains'), orderBy('train_no'));
    const unsub1 = onSnapshot(q1, (snap) => setTrains(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    const q2 = query(collection(db, 'transport_buses'), orderBy('route_id'));
    const unsub2 = onSnapshot(q2, (snap) => setBuses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => { unsub1(); unsub2(); };
  }, []);

  return (
    <div className="container">
      <h2>Transport</h2>

      <h3>Trains</h3>
      {trains.map((t) => (
        <div key={t.id} className="card">
          <b>{t.train_no} - {t.train_name}</b>
          <div>Scheduled: {t.scheduled_arrival} / {t.scheduled_departure}</div>
          <div>Last Station: {t.last_reported_station || '-'}</div>
          <div>ETA: {t.estimated_arrival_time || '-'} | Delay: {t.delay_minutes ?? 0} mins</div>
        </div>
      ))}

      <h3>Buses</h3>
      {buses.map((b) => (
        <div key={b.id} className="card">
          <b>{b.route_name}</b>
          <div>{b.route_id} - {b.stop_name}</div>
          <div>Arrival: {b.arrival_time}</div>
          <div>Days: {b.service_days}</div>
        </div>
      ))}
    </div>
  );
}