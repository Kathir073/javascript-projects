'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const doLogin = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/';
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="container">
      <h2>Admin Login</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={doLogin}>Login</button>
      {error && <p style={{ color: 'tomato' }}>{error}</p>}
    </div>
  );
}