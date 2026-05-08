'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Request, Asset } from '@/lib/db';
import { MPill } from '@/components/ui/Pill';
import { MI } from '@/components/ui/icons';

type FilterId = 'all' | 'open' | 'receipts' | 'completed' | 'denied';

const STAGES = ['SUBMITTED','APPROVED','PAID','RECEIPTS_SUBMITTED','COMPLETED'];

function StagesMini({ stage, total = 6 }: { stage: number; total?: number }) {
  return (
    <div className="stages-mini">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={'s' + (i < stage ? ' done' : i === stage ? ' cur' : '')} />
      ))}
    </div>
  );
}

interface Props {
  requests: Request[];
  assetMap: Record<string, Asset>;
}

export function RequestsList({ requests, assetMap }: Props) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState('');

  const counts = {
    all:       requests.length,
    open:      requests.filter(r => !['COMPLETED','DENIED'].includes(r.status)).length,
    receipts:  requests.filter(r => r.status === 'PAID').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    denied:    requests.filter(r => r.status === 'DENIED').length,
  };

  const q = query.trim().toLowerCase();
  const filtered = requests.filter(r => {
    const statusMatch =
      filter === 'all'       ? true :
      filter === 'open'      ? !['COMPLETED','DENIED'].includes(r.status) :
      filter === 'receipts'  ? r.status === 'PAID' :
      filter === 'completed' ? r.status === 'COMPLETED' :
      filter === 'denied'    ? r.status === 'DENIED' : true;
    if (!statusMatch) return false;
    if (!q) return true;
    const assetName = assetMap[r.asset]?.name.toLowerCase() ?? '';
    return (
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.payee.toLowerCase().includes(q) ||
      assetName.includes(q)
    );
  });

  const FILTERS: { id: FilterId; label: string }[] = [
    { id: 'all',       label: 'All' },
    { id: 'open',      label: 'Open' },
    { id: 'receipts',  label: 'Awaiting receipt' },
    { id: 'completed', label: 'Completed' },
    { id: 'denied',    label: 'Denied' },
  ];

  return (
    <>
      <div className="m-page-title">My requests</div>
      <div style={{ padding: '6px 22px 14px', fontSize: 12.5, color: 'var(--m-ink-2)' }}>
        {counts.all} total · {counts.open} still open
      </div>

      <div className="m-filters">
        {FILTERS.map(f => (
          <div key={f.id} className={'ch' + (filter === f.id ? ' active' : '')} onClick={() => setFilter(f.id)}>
            {f.label} <span className="n">{counts[f.id]}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 22px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'var(--m-glass)', border: '1px solid rgba(15,23,42,0.07)', boxShadow: 'var(--m-card-shadow)' }}>
          <span style={{ color: 'var(--m-ink-3)', display: 'flex', flexShrink: 0 }}>{MI.search}</span>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by ID, title, asset or vendor"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit', color: 'var(--m-ink-0)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'none', color: 'var(--m-ink-3)', cursor: 'pointer', padding: 0, display: 'flex', fontSize: 16, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>

      <div className="m-req-list">
        {requests.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--m-glass)', border: '1px solid rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: 'var(--m-card-shadow)' }}>📋</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--m-ink-0)' }}>No requests yet</div>
            <div style={{ fontSize: 12.5, color: 'var(--m-ink-3)', lineHeight: 1.6, maxWidth: 240 }}>
              Tap the <b>+</b> button below to submit your first payment request.
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--m-ink-3)', fontSize: 13 }}>
            No requests match this filter.
          </div>
        ) : null}
        {filtered.map(r => {
          const stage = STAGES.indexOf(r.status === 'UNDER_REVIEW' ? 'SUBMITTED' : r.status);
          const asset = assetMap[r.asset];
          return (
            <Link key={r.id} href={`/m/requests/${r.id}`} style={{ textDecoration: 'none' }}>
              <div className="m-req">
                <div className="top">
                  <span className="id">{r.id}</span>
                  <MPill status={r.status} />
                  <span className="spacer" />
                  {r.priority === 'high' && <span style={{ fontSize: 11.5, color: 'var(--m-bad)' }}>{MI.flag}</span>}
                </div>
                <div className="ttl">{r.title}</div>
                {stage >= 0 && <StagesMini stage={stage} />}
                <div className="meta">
                  <span>{asset?.name.split(' — ')[0]}</span>
                  <span>·</span>
                  <span><b>{r.currency} {r.amount.toLocaleString()}</b></span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div style={{ height: 20 }} />
    </>
  );
}
