'use client';
import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Asset, PayeeDetails } from '@/lib/db';
import { I } from '@/components/ui/icons';
import { FileUpload, type FileUploadHandle } from '@/components/ui/FileUpload';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { createRequest } from '../actions';

interface Props { assets: Asset[]; vendors: { name: string; details?: PayeeDetails }[]; currency: string; }

export function NewRequestForm({ assets, vendors, currency }: Props) {
  const formRef  = useRef<HTMLFormElement>(null);
  const fileRef  = useRef<FileUploadHandle>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id ?? '');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med');
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'bank' | 'other' | ''>('');
  const [momoNetwork, setMomoNetwork]     = useState('');
  const [momoNumber, setMomoNumber]       = useState('');
  const [momoName, setMomoName]           = useState('');
  const [bankName, setBankName]           = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName]     = useState('');
  const [reference, setReference]         = useState('');

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const deadlineDays = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / 86_400_000)
    : null;

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setError('');
    const data = new FormData(formRef.current);
    if (deadline) data.set('deadline', format(deadline, 'yyyy-MM-dd'));
    data.set('asset', selectedAssetId);
    data.set('priority', priority);
    data.set('currency', currency);
    if (paymentMethod) {
      const pd: PayeeDetails = { method: paymentMethod as PayeeDetails['method'] };
      if (paymentMethod === 'momo') { pd.momoNetwork = momoNetwork; pd.momoNumber = momoNumber; pd.momoName = momoName; }
      if (paymentMethod === 'bank') { pd.bankName = bankName; pd.accountNumber = accountNumber; pd.accountName = accountName; }
      if (paymentMethod === 'other') { pd.reference = reference; }
      data.set('payeeDetails', JSON.stringify(pd));
    }
    startTransition(async () => {
      try {
        const urls = fileRef.current ? await fileRef.current.uploadAll() : [];
        urls.forEach(url => data.append('attachments', url));
        await createRequest(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to submit.');
      }
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="page">
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="row" style={{ marginBottom: 18 }}>
          <div>
            <h1 className="h1">New request</h1>
            <div className="muted small" style={{ marginTop: 4 }}>
              Create and submit a payment request for approval
            </div>
          </div>
          <div className="spacer" />
          <Link href="/requests" className="btn ghost">{I.x}Cancel</Link>
          <button type="submit" className="btn primary" disabled={isPending}>
            {isPending ? 'Submitting…' : <>{I.check}Submit request</>}
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', color: 'var(--bad)', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div className="grid g-2-1">
          {/* Left — form fields */}
          <div className="card glass">
            <div className="card-h">
              <h3>Request details</h3>
              <span className="sub">All fields required unless noted</span>
            </div>

            <div className="grid g-2" style={{ gap: 14 }}>
              {/* Asset select */}
              <div className="field">
                <label>Asset</label>
                <Select value={selectedAssetId} onValueChange={setSelectedAssetId} required>
                  <SelectTrigger className="field-select-trigger">
                    <SelectValue placeholder="Select an asset…" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date picker */}
              <div className="field">
                <label>Need it by</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="field-date-trigger">
                      {I.cal}
                      <span style={{ flex: 1, textAlign: 'left', color: deadline ? 'var(--ink-0)' : 'var(--ink-3)' }}>
                        {deadline ? format(deadline, 'MMM d, yyyy') : 'Pick a date…'}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      disabled={(d) => d < today}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {/* hidden input so FormData still has deadline if JS-populated */}
                <input type="hidden" name="deadline" value={deadline ? format(deadline, 'yyyy-MM-dd') : ''} readOnly />
              </div>

              <div className="field">
                <label>Title</label>
                <input type="text" name="title" required placeholder="e.g. Brake pad replacement" />
              </div>

              <div className="field">
                <label>Payee</label>
                {vendors.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {vendors.map(v => (
                      <button
                        key={v.name} type="button"
                        onClick={() => applyVendor(v)}
                        style={{
                          padding: '4px 11px', borderRadius: 999,
                          fontSize: 12, fontFamily: 'inherit', fontWeight: 500,
                          border: `1.5px solid ${payee === v.name ? 'var(--brand)' : 'var(--line-strong)'}`,
                          background: payee === v.name ? 'var(--brand-soft)' : 'rgba(255,255,255,0.7)',
                          color: payee === v.name ? 'var(--brand)' : 'var(--ink-1)',
                          cursor: 'pointer', transition: 'all 100ms ease',
                        }}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" name="payee" required
                    placeholder={vendors.length > 0 ? 'Or type a new vendor…' : 'e.g. Eastside Diesel LLC'}
                    value={payee}
                    onChange={e => setPayee(e.target.value)}
                    style={{ paddingRight: payee ? 32 : undefined }}
                  />
                  {payee && (
                    <button
                      type="button"
                      onClick={() => setPayee('')}
                      style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(15,23,42,0.07)', border: 'none', borderRadius: '50%',
                        width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--ink-2)', fontSize: 13, lineHeight: 1,
                      }}
                      aria-label="Clear vendor"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Payment method</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {(['momo', 'bank', 'other'] as const).map(m => (
                    <button key={m} type="button"
                      onClick={() => setPaymentMethod(paymentMethod === m ? '' : m)}
                      style={{
                        padding: '5px 14px', borderRadius: 999,
                        fontSize: 12.5, fontFamily: 'inherit', fontWeight: 500,
                        border: `1.5px solid ${paymentMethod === m ? 'var(--brand)' : 'var(--line-strong)'}`,
                        background: paymentMethod === m ? 'var(--brand-soft)' : 'rgba(255,255,255,0.7)',
                        color: paymentMethod === m ? 'var(--brand)' : 'var(--ink-1)',
                        cursor: 'pointer', transition: 'all 100ms ease',
                      }}
                    >
                      {m === 'momo' ? 'MoMo' : m === 'bank' ? 'Bank' : 'Other'}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'momo' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)' }}>Network</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['MTN', 'Vodafone', 'AirtelTigo'].map(n => (
                          <button key={n} type="button"
                            onClick={() => setMomoNetwork(n)}
                            style={{
                              padding: '5px 14px', borderRadius: 999,
                              fontSize: 12, fontFamily: 'inherit', fontWeight: 500,
                              border: `1.5px solid ${momoNetwork === n ? 'var(--brand)' : 'var(--line-strong)'}`,
                              background: momoNetwork === n ? 'var(--brand-soft)' : 'rgba(255,255,255,0.7)',
                              color: momoNetwork === n ? 'var(--brand)' : 'var(--ink-1)',
                              cursor: 'pointer', transition: 'all 100ms ease',
                            }}
                          >{n}</button>
                        ))}
                      </div>
                    </div>
                    <input type="text" placeholder="Phone number (e.g. 0244 123 456)" value={momoNumber} onChange={e => setMomoNumber(e.target.value)} />
                    <input type="text" placeholder="Account name (optional)" value={momoName} onChange={e => setMomoName(e.target.value)} />
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input type="text" placeholder="Bank name (e.g. GCB Bank)" value={bankName} onChange={e => setBankName(e.target.value)} />
                    <input type="text" placeholder="Account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
                    <input type="text" placeholder="Account name" value={accountName} onChange={e => setAccountName(e.target.value)} />
                  </div>
                )}

                {paymentMethod === 'other' && (
                  <div>
                    <input type="text" placeholder="Reference / instructions" value={reference} onChange={e => setReference(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="field">
                <label>Amount ({currency})</label>
                <input type="number" name="amount" required min={0.01} step={0.01} placeholder="0.00" />
              </div>

              {/* Priority select */}
              <div className="field">
                <label>Priority</label>
                <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'med' | 'high')}>
                  <SelectTrigger className="field-select-trigger">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="med">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label>Purpose</label>
              <textarea name="purpose" rows={4} required placeholder="Describe why this payment is needed…" />
            </div>

            <div className="field" style={{ marginTop: 12 }}>
              <label>Additional details <span className="muted small">(optional)</span></label>
              <textarea name="additionalDetails" rows={3} placeholder="Any extra context for the reviewer…" />
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="muted small" style={{ marginBottom: 8 }}>Attachments <span style={{ marginLeft: 4, opacity: 0.6 }}>(optional)</span></div>
              <FileUpload ref={fileRef} inputName="attachments" deferred />
            </div>
          </div>

          {/* Right — submission checks */}
          <div className="card glass">
            <div className="card-h">
              <h3>Submission checks</h3>
              <span className="sub">Before request is routed</span>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <div className="row small">
                <span style={{ color: selectedAsset?.managers.length ? 'var(--good)' : 'var(--warn)' }}>
                  {selectedAsset?.managers.length ? I.check : I.cal}
                </span>
                {selectedAsset?.managers.length
                  ? `Manager: ${selectedAsset.managers.join(', ')}`
                  : 'No manager assigned to this asset'}
              </div>

              <div className="row small">
                <span style={{ color: selectedAsset?.slack ? 'var(--good)' : 'var(--ink-2)' }}>
                  {selectedAsset?.slack ? I.check : I.doc}
                </span>
                {selectedAsset?.slack
                  ? `Slack: ${selectedAsset.slack}`
                  : 'No Slack channel — org default will be used'}
              </div>

              <div className="row small">
                <span style={{ color: deadlineDays !== null && deadlineDays <= 7 ? 'var(--warn)' : 'var(--ink-2)' }}>
                  {I.cal}
                </span>
                {deadlineDays === null
                  ? 'Pick a deadline'
                  : deadlineDays <= 0
                  ? 'Deadline is today or past'
                  : `${deadlineDays} day${deadlineDays !== 1 ? 's' : ''} until deadline`}
              </div>

              <div className="row small">
                <span style={{ color: 'var(--ink-2)' }}>{I.doc}</span>
                Attachments are optional; add them above
              </div>
            </div>

            <div className="divider" />

            {selectedAsset && (
              <div style={{ display: 'grid', gap: 8, fontSize: 12.5 }}>
                <div className="row">
                  <span className="muted">Asset</span>
                  <div className="spacer" />
                  <span>{selectedAsset.name.split(' — ')[0]}</span>
                </div>
                <div className="row">
                  <span className="muted">Tag</span>
                  <div className="spacer" />
                  <span>{selectedAsset.tag}</span>
                </div>
              </div>
            )}

            <div className="divider" />
            <div className="small muted">
              On submit, PayReq creates a new request ID, assigns managers from the selected asset, and posts to Slack.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
