import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

interface Train { id: string; train_no: string; train_name: string; scheduled_arrival: string; scheduled_departure: string; last_reported_station?: string; estimated_arrival_time?: string; delay_minutes?: number; last_updated?: any }
interface Bus { id: string; route_id: string; route_name: string; stop_name: string; arrival_time: string; service_days: string; last_updated?: any }

function isOlderThan(minutes: number, ts?: any) {
  if (!ts?.toDate) return true;
  const updated = ts.toDate().getTime();
  return Date.now() - updated > minutes * 60 * 1000;
}

export default function TransportScreen() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    const q1 = query(collection(db, 'transport_trains'), orderBy('train_no'));
    const unsub1 = onSnapshot(q1, (snap) => setTrains(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    const q2 = query(collection(db, 'transport_buses'), orderBy('route_id'));
    const unsub2 = onSnapshot(q2, (snap) => setBuses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => { unsub1(); unsub2(); };
  }, []);

  const trainsOutdated = useMemo(() => trains.some(t => isOlderThan(10, t.last_updated)), [trains]);
  const busesOutdated = useMemo(() => buses.some(b => isOlderThan(90, b.last_updated)), [buses]);

  return (
    <View style={{ padding: 12, gap: 12 }}>
      {(trainsOutdated || busesOutdated) ? <Text style={{ color: 'tomato' }}>Data may be outdated</Text> : null}

      <Text style={{ fontSize: 18, fontWeight: '700' }}>Trains</Text>
      <FlatList
        data={trains}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: '600' }}>{item.train_no} - {item.train_name}</Text>
            <Text>Scheduled: {item.scheduled_arrival} / {item.scheduled_departure}</Text>
            <Text>ETA: {item.estimated_arrival_time || '-'} | Delay: {item.delay_minutes ?? 0}m</Text>
            <Text>Last station: {item.last_reported_station || '-'}</Text>
          </View>
        )}
      />

      <Text style={{ fontSize: 18, fontWeight: '700' }}>Buses</Text>
      <FlatList
        data={buses}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: '600' }}>{item.route_name}</Text>
            <Text>{item.route_id} - {item.stop_name}</Text>
            <Text>Arrival: {item.arrival_time} | Days: {item.service_days}</Text>
          </View>
        )}
      />
    </View>
  );
}