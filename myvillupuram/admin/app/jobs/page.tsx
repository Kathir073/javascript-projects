'use client';
import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminGuard from '../../components/AdminGuard';

interface JobItem { id?: string; title: string; company: string; description: string; contact_number: string; posted_date?: any }

export default function JobsPage() {
  const [items, setItems] = useState<JobItem[]>([]);
  const [form, setForm] = useState<JobItem>({ title: '', company: '', description: '', contact_number: '' });

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('posted_date', 'desc'));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
    return () => unsub();
  }, []);

  const createItem = async () => {
    if (!form.title) return;
    await addDoc(collection(db, 'jobs'), { ...form, posted_date: serverTimestamp() });
    setForm({ title: '', company: '', description: '', contact_number: '' });
  };

  const removeItem = async (id: string) => {
    await deleteDoc(doc(db, 'jobs', id));
  };

  return (
    <AdminGuard>
      <div className="container">
        <h2>Jobs</h2>
        <div className="card">
          <h3>Create</h3>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Contact Number" value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
          <button onClick={createItem}>Add</button>
        </div>
        {items.map((job) => (
          <div key={job.id} className="card">
            <h3>{job.title}</h3>
            <p>{job.company}</p>
            <p>{job.description}</p>
            <p>{job.contact_number}</p>
            <button onClick={() => removeItem(job.id!)}>Delete</button>
          </div>
        ))}
      </div>
    </AdminGuard>
  );
}