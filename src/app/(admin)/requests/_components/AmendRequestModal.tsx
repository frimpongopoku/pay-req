'use client';
import { useState, useTransition } from 'react';
import { X, Check } from 'lucide-react';
import { amendRequest } from '../actions';
import type { Request } from '@/lib/db';

interface Props {
  request: Request;
  onClose: () => void;
}

export function AmendRequestModal({ request: r, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel glass" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em' }}>Amend request</h3>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{r.id}</div>
          </div>
          <button className="btn ghost" style={{ marginLeft: 'auto', padding: '5px 8px' }} onClick={onClose} disabled={isPending}>
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={e => {
          e.preventDefault();
          setError(null);
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await amendRequest(r.id, fd);
            if (!res?.ok) { setError(res?.error ?? 'Could not save.'); return; }
            onClose();
          });
        }}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Title <span style={{ color: 'var(--bad)' }}>*</span></label>
            <input name="title" defaultValue={r.title} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10, marginBottom: 14 }}>
            <div className="field">
              <label>Currency</label>
              <input name="currency" defaultValue={r.currency} style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12.5 }} />
            </div>
            <div className="field">
              <label>Amount <span style={{ color: 'var(--bad)' }}>*</span></label>
              <input name="amount" type="number" step="0.01" min="0" defaultValue={r.amount} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div className="field">
              <label>Payee <span style={{ color: 'var(--bad)' }}>*</span></label>
              <input name="payee" defaultValue={r.payee} required />
            </div>
            <div className="field">
              <label>Deadline <span style={{ color: 'var(--bad)' }}>*</span></label>
              <input name="deadline" defaultValue={r.deadline} placeholder="e.g. May 15" required />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 18 }}>
            <label>Purpose <span style={{ color: 'var(--bad)' }}>*</span></label>
            <textarea name="purpose" rows={3} defaultValue={r.purpose} required style={{ padding: '9px 12px', borderRadius: 9, border: '1px solid var(--line-strong)', background: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'inherit', color: 'var(--ink-0)', outline: 'none', resize: 'none', lineHeight: 1.5 }} />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 9, marginBottom: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12.5, color: 'var(--bad)' }}>
              <X size={13} strokeWidth={2.5} />{error}
            </div>
          )}

          <button type="submit" className="btn primary" disabled={isPending} style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}>
            <Check size={14} strokeWidth={2.5} className="ic" />
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
