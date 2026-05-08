'use client';
import { useState, useTransition } from 'react';
import { I } from '@/components/ui/icons';
import { saveOrgSettings, deleteAccount, deleteOrganisation } from '../actions';
import type { Organisation } from '@/lib/db';

const CURRENCIES = [
  { code: 'GHS', label: 'GHS — Ghana Cedi' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'NGN', label: 'NGN — Nigerian Naira' },
  { code: 'KES', label: 'KES — Kenyan Shilling' },
  { code: 'ZAR', label: 'ZAR — South African Rand' },
];

export function OrgSettingsForm({ org, isOwner }: { org: Organisation | null; isOwner: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<'account' | 'org' | null>(null);

  function handleDeleteAccount() {
    if (!confirm('Remove your user profile and sign out? Your organisation will remain.\n\nThis cannot be undone.')) return;
    setDeleting('account');
    startTransition(async () => { await deleteAccount(); });
  }

  function handleDeleteOrg() {
    const orgName = org?.name ?? 'this organisation';
    const typed = prompt(`Type the organisation name to confirm deletion:\n\n"${orgName}"\n\nAll requests, assets, users, and data will be permanently deleted.`);
    if (typed?.trim() !== orgName) {
      if (typed !== null) alert('Name did not match. Organisation not deleted.');
      return;
    }
    setDeleting('org');
    startTransition(async () => { await deleteOrganisation(); });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setError('');
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveOrgSettings(data);
      if (res.ok) setSaved(true);
      else setError(res.error ?? 'Could not save.');
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row" style={{ marginBottom: 18 }}>
        <div className="spacer" />
        {saved && <span className="small" style={{ color: 'var(--good)' }}>{I.check} Saved</span>}
        {error && <span className="small" style={{ color: 'var(--bad)' }}>{error}</span>}
        <button type="submit" className="btn primary" disabled={isPending}>
          {I.check}{isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="grid g-2">
        <div className="card glass">
          <div className="card-h"><h3>Workspace details</h3></div>
          <div className="col" style={{ gap: 16 }}>
            <div className="field">
              <label>Organisation name</label>
              <input type="text" name="name" defaultValue={org?.name ?? ''} placeholder="Your organisation name" required />
            </div>

            <div className="field">
              <label>Default currency</label>
              <select
                name="currency"
                defaultValue={org?.currency ?? 'GHS'}
                className="field-select-trigger"
                style={{ appearance: 'auto' }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <div className="hint">Used as the default on all new payment requests.</div>
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h"><h3>Approval settings</h3></div>
          <div className="col" style={{ gap: 16 }}>
            <div className="field">
              <label>Auto-assign to asset managers</label>
              <div className="row" style={{ marginTop: 4 }}>
                <span className="muted small">When a request is submitted, auto-assign to the asset's managers</span>
                <div className="spacer" />
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="track" /><span className="thumb" />
                </label>
              </div>
            </div>
            <div className="divider" />
            <div className="field">
              <label>Fallback to admins</label>
              <div className="row" style={{ marginTop: 4 }}>
                <span className="muted small">If asset has no manager, assign to org admins</span>
                <div className="spacer" />
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="track" /><span className="thumb" />
                </label>
              </div>
            </div>
            <div className="divider" />
            <div className="field">
              <label>SLA — Review deadline (hours)</label>
              <input type="number" defaultValue="24" />
            </div>
            <div className="field">
              <label>SLA — Approval deadline (hours)</label>
              <input type="number" defaultValue="48" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="card" style={{ marginTop: 24, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.03)' }}>
        <div className="card-h" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)', paddingBottom: 12, marginBottom: 0 }}>
          <h3 style={{ color: '#dc2626' }}>Danger zone</h3>
          <span className="sub">Destructive actions — these cannot be undone</span>
        </div>
        <div className="col" style={{ gap: 0, paddingTop: 4 }}>

          <div className="row" style={{ padding: '14px 0', borderBottom: '1px solid rgba(239,68,68,0.1)', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Delete my account</div>
              <div className="muted small" style={{ marginTop: 2 }}>Removes your user profile and signs you out. The organisation and all other data remain.</div>
            </div>
            <button
              type="button"
              className="btn ghost"
              style={{ color: '#dc2626', borderColor: 'rgba(239,68,68,0.4)', flexShrink: 0 }}
              onClick={handleDeleteAccount}
              disabled={deleting !== null}
            >
              {deleting === 'account' ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>

          {isOwner && (
            <div className="row" style={{ padding: '14px 0', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Delete organisation</div>
                <div className="muted small" style={{ marginTop: 2 }}>Permanently deletes <b>{org?.name ?? 'this organisation'}</b> and all its data — requests, assets, users, activity, and settings. You will be signed out.</div>
              </div>
              <button
                type="button"
                className="btn"
                style={{ background: '#dc2626', color: '#fff', border: 'none', flexShrink: 0, opacity: deleting !== null ? 0.6 : 1 }}
                onClick={handleDeleteOrg}
                disabled={deleting !== null}
              >
                {deleting === 'org' ? 'Deleting…' : 'Delete organisation'}
              </button>
            </div>
          )}

        </div>
      </div>
    </form>
  );
}
