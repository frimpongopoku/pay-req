'use client';
import { useTransition } from 'react';
import Link from 'next/link';
import type { Request, Asset, RequestStatus } from '@/lib/db';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Pill';
import { I } from '@/components/ui/icons';
import { advanceStatus, rewindStatus, denyRequest, addAttachments } from '../actions';
import { FileUpload } from '@/components/ui/FileUpload';

const LIFECYCLE_STAGES: RequestStatus[] = [
  'SUBMITTED', 'APPROVED', 'PAID', 'RECEIPTS_SUBMITTED', 'COMPLETED',
];
const STAGE_NAMES = ['Submitted', 'Approved', 'Paid', 'Receipts in', 'Completed'];

const NEXT_ACTIONS: Record<RequestStatus, { label: string; primary: boolean; alt?: string }> = {
  SUBMITTED:          { label: 'Approve',           primary: true, alt: 'Deny' },
  UNDER_REVIEW:       { label: 'Approve',           primary: true, alt: 'Deny' }, // legacy
  APPROVED:           { label: 'Mark as paid',      primary: true },
  PAID:               { label: 'Awaiting receipts', primary: false },
  RECEIPTS_SUBMITTED: { label: 'Mark complete',     primary: true },
  COMPLETED:          { label: 'Reopen',            primary: false },
  DENIED:             { label: 'Reopen',            primary: false },
};

interface Props {
  request: Request;
  asset: Asset;
  assetSpend: number;
  assetOpenCount: number;
  orgCurrency: string;
}

export function RequestDetail({ request: r, asset, assetSpend, assetOpenCount, orgCurrency }: Props) {
  const [isPending, startTransition] = useTransition();

  const displayStatus = r.status === 'UNDER_REVIEW' ? 'SUBMITTED' : r.status;
  const stageIdx = LIFECYCLE_STAGES.indexOf(displayStatus);
  const action = NEXT_ACTIONS[r.status];
  const canRewind = stageIdx > 0 && r.status !== 'DENIED';
  const canAdvance = r.status !== 'COMPLETED';

  function handleAdvance() {
    startTransition(() => advanceStatus(r.id, r.status));
  }

  function handleRewind() {
    startTransition(() => rewindStatus(r.id, r.status));
  }

  function handleDeny() {
    startTransition(() => denyRequest(r.id));
  }

  return (
    <div className="page">
      {/* Page header */}
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <div className="row small muted" style={{ marginBottom: 6 }}>
            <Link href="/requests" className="muted small" style={{ textDecoration: 'none' }}>Requests</Link>
            <span>·</span>
            <span className="id">{r.id}</span>
            <span>·</span>
            <span>Submitted {r.submitted}</span>
            <span>·</span>
            <span className="row" style={{ gap: 4 }}>{I.cal}Due {r.deadline}</span>
          </div>
          <h1 className="h1">{r.title}</h1>
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <Pill status={r.status} />
            <span className="chip">{I.truck}{asset.name}</span>
            <span className="chip">{asset.tag}</span>
            {r.priority === 'high' && (
              <span className="pill denied"><span className="dot" />High priority</span>
            )}
          </div>
        </div>
        <div className="spacer" />
        <button className="btn" onClick={handleRewind} disabled={!canRewind || isPending}>
          {I.arrowDn}Rewind
        </button>
        {action.alt && (
          <button className="btn danger" onClick={handleDeny} disabled={isPending}>
            {I.x}{action.alt}
          </button>
        )}
        <button
          className={'btn' + (action.primary ? ' primary' : '')}
          onClick={handleAdvance}
          disabled={!canAdvance || isPending}
        >
          {isPending ? 'Saving…' : <>{action.primary && I.check}{action.label}{!action.primary && I.arrowR}</>}
        </button>
      </div>

      {/* Lifecycle stepper */}
      <div className="card glass" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
        <div className="stepper">
          {LIFECYCLE_STAGES.map((s, i) => {
            const isDone    = i < stageIdx;
            const isCurrent = i === stageIdx;
            const cls = isDone ? 'done' : isCurrent ? 'current' : '';
            return (
              <div key={s} className={`step ${cls}`}>
                <div className="lbl">Step {i + 1}</div>
                <div className="name">{STAGE_NAMES[i]}</div>
                <div className="ts">{isCurrent ? r.submitted : isDone ? '✓' : '—'}</div>
                <div className="marker" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid g-2-1">
        {/* Left column */}
        <div className="col" style={{ gap: 16 }}>
          {/* Request details */}
          <div className="card glass">
            <div className="card-h"><h3>Request details</h3></div>
            <div className="grid g-2" style={{ gap: 18, fontSize: 13 }}>
              <div>
                <div className="muted small" style={{ marginBottom: 4 }}>Amount</div>
                <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  {r.currency} {r.amount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="muted small" style={{ marginBottom: 4 }}>Payee</div>
                <div style={{ fontWeight: 500 }}>{r.payee}</div>
                <div className="muted small">Vendor · ACH</div>
              </div>
              {r.payeeDetails?.method && (
                <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                  <div className="muted small" style={{ marginBottom: 6 }}>Payment details</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {r.payeeDetails.method === 'momo' && (
                      <>
                        <span className="chip">{r.payeeDetails.momoNetwork ?? 'MoMo'}</span>
                        {r.payeeDetails.momoNumber && <span className="chip">{r.payeeDetails.momoNumber}</span>}
                        {r.payeeDetails.momoName && <span className="chip">{r.payeeDetails.momoName}</span>}
                      </>
                    )}
                    {r.payeeDetails.method === 'bank' && (
                      <>
                        {r.payeeDetails.bankName && <span className="chip">{r.payeeDetails.bankName}</span>}
                        {r.payeeDetails.accountNumber && <span className="chip">{r.payeeDetails.accountNumber}</span>}
                        {r.payeeDetails.accountName && <span className="chip">{r.payeeDetails.accountName}</span>}
                      </>
                    )}
                    {r.payeeDetails.method === 'other' && r.payeeDetails.reference && (
                      <span className="chip">{r.payeeDetails.reference}</span>
                    )}
                  </div>
                </div>
              )}
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="muted small" style={{ marginBottom: 4 }}>Purpose</div>
                <div style={{ lineHeight: 1.55 }}>{r.purpose}</div>
              </div>
              {r.additionalDetails && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="muted small" style={{ marginBottom: 4 }}>Additional details</div>
                  <div className="muted" style={{ lineHeight: 1.55 }}>{r.additionalDetails}</div>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="card glass">
            <div className="card-h">
              <h3>Attachments</h3>
              <span className="sub">{r.attachments.length} file{r.attachments.length !== 1 ? 's' : ''}</span>
            </div>
            <AttachmentsPanel requestId={r.id} existing={r.attachments} />
          </div>

          {/* Discussion — not yet implemented */}
          {/* <div className="card glass">
            <div className="card-h">
              <h3>Discussion</h3>
              <span className="sub">Synced to Slack</span>
            </div>
            <div className="feed">
              <div className="item">
                <Avatar name="System" size={28} hue={280} />
                <div className="body">
                  <b>System</b> — Request submitted by <b>{r.requester}</b>.
                  {asset.slack && <div className="meta">Slack notification posted to {asset.slack}</div>}
                </div>
                <div className="ts">{r.submitted}</div>
              </div>
            </div>
            <div className="row" style={{ marginTop: 14, padding: 10, background: 'rgba(255,255,255,0.7)', border: '1px solid var(--line)', borderRadius: 12 }}>
              <Avatar name="Admin" size={26} />
              <input type="text" placeholder="Reply… (Slack-synced)" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontFamily: 'inherit' }} />
              <button className="btn primary small">Send</button>
            </div>
          </div> */}
        </div>

        {/* Right column */}
        <div className="col" style={{ gap: 16 }}>
          {/* Requester */}
          <div className="card glass">
            <div className="card-h"><h3>Requester</h3></div>
            <div className="row" style={{ gap: 12 }}>
              <Avatar name={r.requester} size={42} />
              <div>
                <div style={{ fontWeight: 500 }}>{r.requester}</div>
                <div className="muted small">Employee</div>
              </div>
            </div>
          </div>

          {/* Asset */}
          <div className="card glass">
            <div className="card-h"><h3>Asset</h3></div>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#cbd5e1,#64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                {I.truck}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{asset.name}</div>
                <div className="muted small">{asset.tag}</div>
              </div>
            </div>
            <div className="divider" />
            <div className="grid g-2" style={{ gap: 8, fontSize: 12.5 }}>
              <div className="muted">Manager</div>
              <div style={{ textAlign: 'right' }}>{asset.managers.join(', ')}</div>
              <div className="muted">Slack channel</div>
              <div style={{ textAlign: 'right' }}>{asset.slack ?? <span className="muted">Org default</span>}</div>
              <div className="muted">YTD spend</div>
              <div style={{ textAlign: 'right' }}>{orgCurrency} {assetSpend.toLocaleString()}</div>
              <div className="muted">Open requests</div>
              <div style={{ textAlign: 'right' }}>{assetOpenCount}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AttachmentsPanel({ requestId, existing }: { requestId: string; existing: string[] }) {
  const [, startTransition] = useTransition();

  function handleUploaded(urls: string[]) {
    startTransition(() => addAttachments(requestId, urls));
  }

  return <FileUpload inputName="_unused" existing={existing} onUploadComplete={handleUploaded} />;
}
