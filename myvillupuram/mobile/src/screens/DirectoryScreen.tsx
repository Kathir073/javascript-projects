import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, TextInput } from 'react-native';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import ItemCard from '../components/ItemCard';

interface DirItem { id: string; name: string; phone: string; location_link: string; category: string; image: string }

export default function DirectoryScreen() {
  const [items, setItems] = useState<DirItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'directory'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => unsub();
  }, []);

  const filtered = useMemo(() => items.filter(it =>
    (!category || it.category?.toLowerCase() === category.toLowerCase()) &&
    (!search || it.name.toLowerCase().includes(search.toLowerCase()))
  ), [items, search, category]);

  return (
    <View style={{ padding: 12 }}>
      <TextInput placeholder="Search" value={search} onChangeText={setSearch} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <TextInput placeholder="Filter by category" value={category} onChangeText={setCategory} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <ItemCard title={item.name} subtitle={`${item.category} • ${item.phone}`} image={item.image} />
        )}
      />
    </View>
  );
}