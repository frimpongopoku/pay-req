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
import type { Asset, PayeeDetails } from '@/lib/db';

interface Props {
  assets: Asset[];
  vendors: { name: string; details?: PayeeDetails }[];
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
  const [payee, setPayee]       = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'bank' | 'other' | ''>('');
  const [momoNetwork, setMomoNetwork]     = useState('');
  const [momoNumber, setMomoNumber]       = useState('');
  const [momoName, setMomoName]           = useState('');
  const [bankName, setBankName]           = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName]     = useState('');
  const [reference, setReference]         = useState('');

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 14,
    border: '1px solid var(--m-line)', background: 'var(--m-glass-2)',
    fontSize: 14, fontFamily: 'inherit', color: 'var(--m-ink-1)',
    boxSizing: 'border-box',
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function applyVendor(v: { name: string; details?: PayeeDetails }) {
    setPayee(v.name);
    if (v.details?.method) {
      setPaymentMethod(v.details.method);
      setMomoNetwork(v.details.momoNetwork ?? '');
      setMomoNumber(v.details.momoNumber ?? '');
      setMomoName(v.details.momoName ?? '');
      setBankName(v.details.bankName ?? '');
      setAccountNumber(v.details.accountNumber ?? '');
      setAccountName(v.details.accountName ?? '');
      setReference(v.details.reference ?? '');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setError('');

    const data = new FormData(formRef.current);
    data.set('priority', priority);
    data.set('asset', assetId);
    data.set('currency', currency);
    if (paymentMethod) {
      const pd: PayeeDetails = { method: paymentMethod as PayeeDetails['method'] };
      if (paymentMethod === 'momo') { pd.momoNetwork = momoNetwork; pd.momoNumber = momoNumber; pd.momoName = momoName; }
      if (paymentMethod === 'bank') { pd.bankName = bankName; pd.accountNumber = accountNumber; pd.accountName = accountName; }
      if (paymentMethod === 'other') { pd.reference = reference; }
      data.set('payeeDetails', JSON.stringify(pd));
    }
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

        {/* Payee with saved vendor chips */}
        <div className="m-form-field">
          <label htmlFor="payee">Payee / Vendor</label>

          {vendors.length > 0 && (
            <div style={{
              display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2,
              marginBottom: 10, scrollbarWidth: 'none',
            }}>
              {vendors.map(v => (
                <button
                  key={v.name} type="button"
                  onClick={() => applyVendor(v)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 13px', borderRadius: 999,
                    fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
                    border: `1.5px solid ${payee === v.name ? 'var(--m-accent)' : 'var(--m-line-strong)'}`,
                    background: payee === v.name ? 'var(--m-accent-soft)' : 'rgba(255,252,247,0.7)',
                    color: payee === v.name ? 'var(--m-accent)' : 'var(--m-ink-1)',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 120ms ease',
                  }}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <input
              id="payee" name="payee" required
              placeholder={vendors.length > 0 ? 'Or type a new vendor…' : 'e.g. Eastside Diesel LLC'}
              value={payee}
              onChange={e => setPayee(e.target.value)}
              style={{ ...fieldStyle, paddingRight: payee ? 40 : 14 }}
            />
            {payee && (
              <button
                type="button"
                onClick={() => setPayee('')}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'rgba(28,25,23,0.08)', border: 'none', borderRadius: '50%',
                  width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--m-ink-2)', fontSize: 14, lineHeight: 1,
                }}
                aria-label="Clear vendor"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Payment method */}
        <div className="m-form-field">
          <label>Payment method</label>
          <div className="seg">
            {(['momo', 'bank', 'other'] as const).map(m => (
              <button key={m} type="button"
                className={'opt' + (paymentMethod === m ? ' active' : '')}
                onClick={() => setPaymentMethod(paymentMethod === m ? '' : m)}
              >
                {m === 'momo' ? 'MoMo' : m === 'bank' ? 'Bank' : 'Other'}
              </button>
            ))}
          </div>

          {paymentMethod === 'momo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--m-ink-2)' }}>Network</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['MTN', 'Vodafone', 'AirtelTigo'].map(n => (
                    <button key={n} type="button"
                      onClick={() => setMomoNetwork(n)}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 10, fontSize: 12.5, fontFamily: 'inherit', fontWeight: 500,
                        border: `1.5px solid ${momoNetwork === n ? 'var(--m-accent)' : 'var(--m-line-strong)'}`,
                        background: momoNetwork === n ? 'var(--m-accent-soft)' : 'rgba(255,252,247,0.7)',
                        color: momoNetwork === n ? 'var(--m-accent)' : 'var(--m-ink-1)',
                        cursor: 'pointer',
                      }}
                    >{n}</button>
                  ))}
                </div>
              </div>
              <input placeholder="Phone number (e.g. 0244 123 456)" value={momoNumber} onChange={e => setMomoNumber(e.target.value)} style={fieldStyle} />
              <input placeholder="Account name (optional)" value={momoName} onChange={e => setMomoName(e.target.value)} style={fieldStyle} />
            </div>
          )}

          {paymentMethod === 'bank' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              <input placeholder="Bank name (e.g. GCB Bank)" value={bankName} onChange={e => setBankName(e.target.value)} style={fieldStyle} />
              <input placeholder="Account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} style={fieldStyle} />
              <input placeholder="Account name" value={accountName} onChange={e => setAccountName(e.target.value)} style={fieldStyle} />
            </div>
          )}

          {paymentMethod === 'other' && (
            <div style={{ marginTop: 12 }}>
              <input placeholder="Reference / instructions" value={reference} onChange={e => setReference(e.target.value)} style={fieldStyle} />
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
