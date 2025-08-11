import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import ItemCard from '../components/ItemCard';

interface Item { id: string; item_name: string; price: number; description: string; photo: string; seller_contact: string; approved: boolean }

export default function MarketplaceScreen() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'marketplace'), where('approved', '==', true), orderBy('item_name'));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => unsub();
  }, []);

  return (
    <View style={{ padding: 12 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <ItemCard title={`${item.item_name} • ₹${item.price}`} subtitle={`${item.description}\n${item.seller_contact}`} image={item.photo} />
        )}
      />
    </View>
  );
}