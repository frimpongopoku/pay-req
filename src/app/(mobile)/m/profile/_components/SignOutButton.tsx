'use client';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase-client';

export function SignOutButton() {
  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/signin';
  }

  return (
    <button className="btn danger" style={{ justifyContent: 'flex-start' }} onClick={handleSignOut}>
      Sign out
    </button>
  );
}
