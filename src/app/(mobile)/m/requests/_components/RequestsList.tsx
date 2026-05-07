'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Request, Asset } from '@/lib/db';
import { MPill } from '@/components/ui/Pill';
import { MI } from '@/components/ui/icons';

type FilterId = 'all' | 'open' | 'receipts' | 'completed' | 'denied';

const STAGES = ['SUBMITTED','UNDER_REVIEW','APPROVED','PAID','RECEIPTS_SUBMITTED','COMPLETED'];

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

  const counts = {
    all:       requests.length,
    open:      requests.filter(r => !['COMPLETED','DENIED'].includes(r.status)).length,
    receipts:  requests.filter(r => r.status === 'PAID').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    denied:    requests.filter(r => r.status === 'DENIED').length,
  };

  const filtered = requests.filter(r => {
    if (filter === 'all')       return true;
    if (filter === 'open')      return !['COMPLETED','DENIED'].includes(r.status);
    if (filter === 'receipts')  return r.status === 'PAID';
    if (filter === 'completed') return r.status === 'COMPLETED';
    if (filter === 'denied')    return r.status === 'DENIED';
    return true;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'var(--m-glass-2)', border: '1px solid var(--m-line)', color: 'var(--m-ink-3)', fontSize: 13 }}>
          {MI.search}<span>Search by ID, asset or vendor</span>
        </div>
      </div>

      <div className="m-req-list">
        {filtered.length === 0 && (
          <div style={{ padding: '24px 22px', textAlign: 'center', color: 'var(--m-ink-3)', fontSize: 13 }}>
            No requests here.
          </div>
        )}
        {filtered.map(r => {
          const stage = STAGES.indexOf(r.status);
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
