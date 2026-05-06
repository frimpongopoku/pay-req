'use client';
import { useTransition } from 'react';
import { revokeInvite } from '../actions';

export function RevokeButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="btn ghost"
      style={{ padding: '2px 8px', fontSize: 12, color: 'var(--bad)' }}
      disabled={pending}
      onClick={() => startTransition(() => revokeInvite(id))}
    >
      {pending ? '…' : 'Revoke'}
    </button>
  );
}
