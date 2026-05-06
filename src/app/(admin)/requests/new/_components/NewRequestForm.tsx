'use client';
import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Asset } from '@/lib/db';
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

interface Props { assets: Asset[]; vendors: string[]; currency: string; }

export function NewRequestForm({ assets, vendors, currency }: Props) {
  const formRef  = useRef<HTMLFormElement>(null);
  const fileRef  = useRef<FileUploadHandle>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id ?? '');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med');

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const deadlineDays = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / 86_400_000)
    : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setError('');
    const data = new FormData(formRef.current);
    if (deadline) data.set('deadline', format(deadline, 'yyyy-MM-dd'));
    data.set('asset', selectedAssetId);
    data.set('priority', priority);
    data.set('currency', currency);
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
                  <datalist id="admin-vendors-list">
                    {vendors.map(v => <option key={v} value={v} />)}
                  </datalist>
                )}
                <input
                  type="text" name="payee" required
                  placeholder="e.g. Eastside Diesel LLC"
                  list={vendors.length > 0 ? 'admin-vendors-list' : undefined}
                />
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
