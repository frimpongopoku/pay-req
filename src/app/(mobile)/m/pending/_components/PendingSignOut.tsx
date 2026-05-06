'use client';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase-client';

export function PendingSignOut() {
  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/signin';
  }

  return (
    <button className="btn danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSignOut}>
      Sign out
    </button>
  );
}
