'use client';
import { useState, useTransition } from 'react';
import { I } from '@/components/ui/icons';
import { saveOrgSettings } from '../actions';
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

export function OrgSettingsForm({ org }: { org: Organisation | null }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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
    </form>
  );
}
