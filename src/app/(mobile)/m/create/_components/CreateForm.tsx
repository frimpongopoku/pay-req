'use client';
import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { MI } from '@/components/ui/icons';
import { FileUpload } from '@/components/ui/FileUpload';
import { submitRequest } from '../actions';
import type { Asset } from '@/lib/db';

export function CreateForm({ assets }: { assets: Asset[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    data.set('priority', priority);
    setError('');
    startTransition(async () => {
      try {
        await submitRequest(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to submit. Try again.');
      }
    });
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid var(--m-line)',
    background: 'var(--m-glass-2)',
    fontSize: 14,
    fontFamily: 'inherit',
    color: 'var(--m-ink-1)',
    boxSizing: 'border-box',
  };

  return (
    <>
      <div className="m-header" style={{ paddingBottom: 4 }}>
        <Link href="/m" className="m-icon-btn" style={{ background: 'transparent', border: 'none', textDecoration: 'none' }}>
          {MI.back}
        </Link>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>New request</div>
        <div style={{ width: 40 }} />
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="m-form-field">
          <label htmlFor="asset">Asset</label>
          <select id="asset" name="asset" required style={{ ...fieldStyle, appearance: 'none' }}>
            <option value="">Select an asset…</option>
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="m-form-field">
          <label htmlFor="title">What do you need?</label>
          <input id="title" name="title" required placeholder="e.g. Brake pad replacement" style={fieldStyle} />
        </div>

        <div className="m-form-field">
          <label htmlFor="amount">Amount (USD)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--m-ink-2)', fontSize: 14 }}>$</span>
            <input id="amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" style={{ ...fieldStyle, paddingLeft: 26 }} />
          </div>
        </div>

        <div className="m-form-field">
          <label>Priority</label>
          <div className="seg">
            {(['low', 'med', 'high'] as const).map(p => (
              <button key={p} type="button" className={'opt' + (priority === p ? ' active' : '')} onClick={() => setPriority(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="m-form-field">
          <label htmlFor="deadline">Need it by</label>
          <input id="deadline" name="deadline" type="date" required min={new Date().toISOString().split('T')[0]} style={fieldStyle} />
        </div>

        <div className="m-form-field">
          <label htmlFor="payee">Payee / Vendor</label>
          <input id="payee" name="payee" required placeholder="e.g. Eastside Diesel LLC" style={fieldStyle} />
        </div>

        <div className="m-form-field">
          <label htmlFor="purpose">Purpose</label>
          <textarea id="purpose" name="purpose" required rows={4} placeholder="Describe why this payment is needed…" style={{ ...fieldStyle, resize: 'none' }} />
        </div>

        <div className="m-form-field">
          <label>Attachments <span style={{ opacity: 0.55, fontSize: 12 }}>(optional)</span></label>
          <FileUpload inputName="attachments" variant="mobile" />
        </div>

        {error && (
          <div style={{ margin: '0 22px', padding: '10px 14px', borderRadius: 12, background: 'rgba(220,38,38,0.08)', color: 'var(--m-bad)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ height: 110 }} />

        <div className="m-cta">
          <button type="submit" className="btn" disabled={isPending}>
            {isPending ? 'Submitting…' : <>Submit request {MI.arrowR}</>}
          </button>
        </div>
      </form>
    </>
  );
}
