'use client';
import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/AdminGuard';

interface Item { id?: string; item_name: string; price: number | string; description: string; photo: string; seller_contact: string; approved?: boolean }

export default function MarketplacePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<Item>({ item_name: '', price: '', description: '', photo: '', seller_contact: '' });

  useEffect(() => {
    const q = query(collection(db, 'marketplace'), orderBy('item_name'));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => unsub();
  }, []);

  const createItem = async () => {
    if (!form.item_name) return;
    await addDoc(collection(db, 'marketplace'), { ...form, price: Number(form.price || 0), approved: false });
    setForm({ item_name: '', price: '', description: '', photo: '', seller_contact: '' });
  };

  const approve = async (id: string) => {
    await updateDoc(doc(db, 'marketplace', id), { approved: true });
  };

  const removeItem = async (id: string) => {
    await deleteDoc(doc(db, 'marketplace', id));
  };

  return (
    <AdminGuard>
      <div className="container">
        <h2>Marketplace</h2>
        <div className="card">
          <h3>Create</h3>
          <input placeholder="Item Name" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
          <input placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Photo URL" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          <input placeholder="Seller Contact" value={form.seller_contact} onChange={(e) => setForm({ ...form, seller_contact: e.target.value })} />
          <button onClick={createItem}>Add</button>
        </div>
        {items.map((it) => (
          <div key={it.id} className="card">
            <h3>{it.item_name} {it.approved ? '✅' : '⏳'}</h3>
            <p>₹{it.price}</p>
            <p>{it.description}</p>
            <p>{it.seller_contact}</p>
            {it.photo && <img alt="" src={it.photo} style={{ maxWidth: 300 }} />}
            {!it.approved && <button onClick={() => approve(it.id!)}>Approve</button>}
            <button onClick={() => removeItem(it.id!)}>Delete</button>
          </div>
        ))}
      </div>
    </AdminGuard>
  );
}