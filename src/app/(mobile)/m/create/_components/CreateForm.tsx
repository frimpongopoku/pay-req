'use client';
import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { MI } from '@/components/ui/icons';
import { FileUpload, type FileUploadHandle } from '@/components/ui/FileUpload';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { submitRequest } from '../actions';
import type { Asset } from '@/lib/db';

interface Props {
  assets: Asset[];
  vendors: string[];
  currency: string;
}

export function CreateForm({ assets, vendors, currency }: Props) {
  const formRef    = useRef<HTMLFormElement>(null);
  const fileRef    = useRef<FileUploadHandle>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError]       = useState('');
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med');
  const [assetId, setAssetId]   = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 14,
    border: '1px solid var(--m-line)', background: 'var(--m-glass-2)',
    fontSize: 14, fontFamily: 'inherit', color: 'var(--m-ink-1)',
    boxSizing: 'border-box',
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setError('');

    const data = new FormData(formRef.current);
    data.set('priority', priority);
    data.set('asset', assetId);
    data.set('currency', currency);
    if (deadline) data.set('deadline', format(deadline, 'yyyy-MM-dd'));

    startTransition(async () => {
      try {
        // Upload files at submit time, not at selection time
        const urls = fileRef.current ? await fileRef.current.uploadAll() : [];
        urls.forEach(url => data.append('attachments', url));
        await submitRequest(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to submit. Try again.');
      }
    });
  }

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
        {/* Asset */}
        <div className="m-form-field">
          <label>Asset</label>
          <Select value={assetId} onValueChange={setAssetId} required>
            <SelectTrigger className="m-select-trigger">
              <SelectValue placeholder="Select an asset…" />
            </SelectTrigger>
            <SelectContent>
              {assets.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="m-form-field">
          <label htmlFor="title">What do you need?</label>
          <input id="title" name="title" required placeholder="e.g. Brake pad replacement" style={fieldStyle} />
        </div>

        {/* Amount */}
        <div className="m-form-field">
          <label htmlFor="amount">Amount ({currency})</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--m-ink-3)', fontSize: 12, fontWeight: 600 }}>{currency}</span>
            <input
              id="amount" name="amount" type="number" min="0.01" step="0.01" required
              placeholder="0.00"
              style={{ ...fieldStyle, paddingLeft: currency.length * 8 + 18 }}
            />
          </div>
        </div>

        {/* Priority */}
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

        {/* Deadline */}
        <div className="m-form-field">
          <label>Need it by</label>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="m-date-trigger">
                {MI.cal}
                <span style={{ flex: 1, textAlign: 'left', color: deadline ? 'var(--m-ink-0)' : 'var(--m-ink-3)' }}>
                  {deadline ? format(deadline, 'MMM d, yyyy') : 'Pick a date…'}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="top">
              <Calendar mode="single" selected={deadline} onSelect={setDeadline} disabled={(d) => d < today} initialFocus />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="deadline" value={deadline ? format(deadline, 'yyyy-MM-dd') : ''} readOnly />
        </div>

        {/* Payee with vendor suggestions */}
        <div className="m-form-field">
          <label htmlFor="payee">Payee / Vendor</label>
          {vendors.length > 0 && (
            <datalist id="vendors-list">
              {vendors.map(v => <option key={v} value={v} />)}
            </datalist>
          )}
          <input
            id="payee" name="payee" required
            placeholder="e.g. Eastside Diesel LLC"
            list={vendors.length > 0 ? 'vendors-list' : undefined}
            style={fieldStyle}
          />
          {vendors.length > 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--m-ink-3)', marginTop: 4 }}>
              Tap to see your previously used vendors
            </div>
          )}
        </div>

        {/* Purpose */}
        <div className="m-form-field">
          <label htmlFor="purpose">Purpose</label>
          <textarea
            id="purpose" name="purpose" required rows={4}
            placeholder="Describe why this payment is needed…"
            style={{ ...fieldStyle, resize: 'none' }}
          />
        </div>

        {/* Attachments — deferred: preview only, uploads on submit */}
        <div className="m-form-field">
          <label>Attachments <span style={{ opacity: 0.55, fontSize: 12 }}>(optional)</span></label>
          <FileUpload ref={fileRef} variant="mobile" deferred />
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
