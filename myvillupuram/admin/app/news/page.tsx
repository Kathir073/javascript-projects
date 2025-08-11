'use client';

import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/AdminGuard';

interface NewsItem { id?: string; title: string; description: string; image: string; category: string; posted_date?: any }

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<NewsItem>({ title: '', description: '', image: '', category: '' });

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('posted_date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  const createItem = async () => {
    if (!form.title) return;
    await addDoc(collection(db, 'news'), { ...form, posted_date: serverTimestamp() });
    setForm({ title: '', description: '', image: '', category: '' });
  };

  const removeItem = async (id: string) => {
    await deleteDoc(doc(db, 'news', id));
  };

  return (
    <AdminGuard>
      <div className="container">
        <h2>News</h2>
        <div className="card">
          <h3>Create</h3>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <button onClick={createItem}>Add</button>
        </div>

        {items.map((n) => (
          <div key={n.id} className="card">
            <h3>{n.title}</h3>
            <p>{n.description}</p>
            <p><b>Category:</b> {n.category}</p>
            {n.image && <img alt="" src={n.image} style={{ maxWidth: 300 }} />}
            <button onClick={() => removeItem(n.id!)}>Delete</button>
          </div>
        ))}
      </div>
    </AdminGuard>
  );
}