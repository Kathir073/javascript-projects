'use client';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, getIdTokenResult, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'unauth' | 'notadmin' | 'ok'>('loading');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setStatus('unauth');
      try {
        const token = await getIdTokenResult(user, true);
        if (token.claims.isAdmin) setStatus('ok');
        else setStatus('notadmin');
      } catch {
        setStatus('notadmin');
      }
    });
    return () => unsub();
  }, []);

  if (status === 'loading') return <div className="container">Loading…</div>;
  if (status === 'unauth') return <div className="container"><p>Please <a href="/login">log in</a> as admin.</p></div>;
  if (status === 'notadmin') return <div className="container"><p>Access denied. Not an admin.</p><button onClick={() => signOut(auth)}>Sign out</button></div>;
  return <>{children}</>;
}