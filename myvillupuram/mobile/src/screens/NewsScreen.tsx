import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import ItemCard from '../components/ItemCard';

interface NewsItem { id: string; title: string; description: string; image: string; category: string; posted_date: any }

export default function NewsScreen() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('posted_date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  return (
    <View style={{ padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />}
        renderItem={({ item }) => (
          <ItemCard title={item.title} subtitle={item.description} image={item.image} />
        )}
      />
    </View>
  );
}