'use client';
import { useState, useTransition } from 'react';
import { inviteUser } from '../actions';
import type { Invite } from '@/lib/db';

const ROLES: Invite['role'][] = ['Employee', 'Manager', 'Admin'];

export function InviteButton({ orgName }: { orgName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        + Invite
      </button>
      {open && <InviteModal orgName={orgName} onClose={() => setOpen(false)} />}
    </>
  );
}

function InviteModal({ orgName, onClose }: { orgName: string; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Invite['role']>('Employee');
  const [error, setError] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function buildMessage(e: string) {
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    return `Hi! You've been invited to join ${orgName || 'PayReq'} as a ${role}.\n\nSign in with your Google account (${e}) at:\n${url}/auth/signin\n\nYour access will be granted automatically.`;
  }

  function copyMessage() {
    navigator.clipboard.writeText(buildMessage(invitedEmail));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function submit() {
    setError('');
    const trimmed = email.trim().toLowerCase();
    startTransition(async () => {
      const res = await inviteUser(trimmed, role);
      if (res.error) { setError(res.error); return; }
      setInvitedEmail(trimmed);
    });
  }

  if (invitedEmail) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="card glass-strong" style={{ width: '100%', maxWidth: 420 }}>
          <div className="row" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Invite created</h2>
            <div className="spacer" />
            <button className="btn ghost" style={{ padding: '4px 8px' }} onClick={onClose}>✕</button>
          </div>
          <div className="small muted" style={{ marginBottom: 12 }}>
            Send this message to <strong>{invitedEmail}</strong> so they know how to join.
          </div>
          <div style={{
            background: 'rgba(15,23,42,0.04)', borderRadius: 10, padding: '12px 14px',
            fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            border: '1px solid var(--glass-border)', marginBottom: 14,
          }}>
            {buildMessage(invitedEmail)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" style={{ flex: 1, justifyContent: 'center' }} onClick={copyMessage}>
              {copied ? '✓ Copied!' : 'Copy message'}
            </button>
            <button className="btn ghost" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card glass-strong" style={{ width: '100%', maxWidth: 420 }}>
        <div className="row" style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Invite someone</h2>
          <div className="spacer" />
          <button className="btn ghost" style={{ padding: '4px 8px' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Email address</label>
            <input
              type="text"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: `2px solid ${role === r ? 'var(--brand)' : 'var(--glass-border)'}`,
                    background: role === r ? 'var(--brand-soft)' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: role === r ? 600 : 400,
                    color: role === r ? 'var(--brand)' : 'var(--ink-1)',
                    transition: 'all 0.15s',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>
              {role === 'Admin' && 'Full access — can manage all requests, assets and users.'}
              {role === 'Manager' && 'Can review and approve requests for assigned assets.'}
              {role === 'Employee' && 'Can submit and track their own payment requests.'}
            </div>
          </div>

          {error && (
            <div className="small" style={{ color: 'var(--bad)', marginTop: -4 }}>{error}</div>
          )}

          <button
            className="btn primary"
            style={{ justifyContent: 'center', marginTop: 4 }}
            onClick={submit}
            disabled={pending || !email}
          >
            {pending ? 'Creating…' : 'Create invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
