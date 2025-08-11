'use client';
import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/AdminGuard';

interface DirItem { id?: string; name: string; phone: string; location_link: string; category: string; image: string }

export default function DirectoryPage() {
  const [items, setItems] = useState<DirItem[]>([]);
  const [form, setForm] = useState<DirItem>({ name: '', phone: '', location_link: '', category: '', image: '' });

  useEffect(() => {
    const q = query(collection(db, 'directory'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => unsub();
  }, []);

  const createItem = async () => {
    if (!form.name) return;
    await addDoc(collection(db, 'directory'), form);
    setForm({ name: '', phone: '', location_link: '', category: '', image: '' });
  };

  const removeItem = async (id: string) => {
    await deleteDoc(doc(db, 'directory', id));
  };

  return (
    <AdminGuard>
      <div className="container">
        <h2>Directory</h2>
        <div className="card">
          <h3>Create</h3>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Location Link" value={form.location_link} onChange={(e) => setForm({ ...form, location_link: e.target.value })} />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <button onClick={createItem}>Add</button>
        </div>
        {items.map((it) => (
          <div key={it.id} className="card">
            <h3>{it.name}</h3>
            <p>{it.phone}</p>
            <p>{it.category}</p>
            <a href={it.location_link} target="_blank" rel="noreferrer">Location</a>
            {it.image && <img alt="" src={it.image} style={{ maxWidth: 300 }} />}
            <button onClick={() => removeItem(it.id!)}>Delete</button>
          </div>
        ))}
      </div>
    </AdminGuard>
  );
}