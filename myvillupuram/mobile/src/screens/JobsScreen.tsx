import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import ItemCard from '../components/ItemCard';

interface Job { id: string; title: string; company: string; description: string; contact_number: string; posted_date: any }

export default function JobsScreen() {
  const [items, setItems] = useState<Job[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('posted_date', 'desc'));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => unsub();
  }, []);

  return (
    <View style={{ padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <ItemCard title={`${item.title} • ${item.company}`} subtitle={`${item.description}\nContact: ${item.contact_number}`} />
        )}
      />
    </View>
  );
}