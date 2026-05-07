'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Request, Asset } from '@/lib/db';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Pill';
import { I } from '@/components/ui/icons';

type FilterId = 'all' | 'open' | 'mine' | 'APPROVED' | 'PAID';

const TABS: { id: FilterId; label: string; count: (r: Request[]) => number }[] = [
  { id: 'all',      label: 'All',      count: r => r.length },
  { id: 'open',     label: 'Open',     count: r => r.filter(x => !['COMPLETED', 'DENIED'].includes(x.status)).length },
  { id: 'mine',     label: 'Needs me', count: r => r.filter(x => x.status === 'SUBMITTED').length },
  { id: 'APPROVED', label: 'Approved', count: r => r.filter(x => x.status === 'APPROVED').length },
  { id: 'PAID',     label: 'Paid',     count: r => r.filter(x => x.status === 'PAID').length },
];

interface Props {
  requests: Request[];
  assetMap: Record<string, Asset>;
}

export function RequestsTable({ requests, assetMap }: Props) {
  const [filter, setFilter] = useState<FilterId>('all');

  const filtered = requests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'open') return !['COMPLETED', 'DENIED'].includes(r.status);
    if (filter === 'mine') return r.status === 'SUBMITTED';
    return r.status === filter;
  });

  return (
    <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px', borderBottom: '1px solid var(--line)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className="btn ghost"
            style={{
              fontWeight: filter === t.id ? 600 : 400,
              color: filter === t.id ? 'var(--ink-0)' : 'var(--ink-2)',
              background: filter === t.id ? 'rgba(255,255,255,0.85)' : 'transparent',
              border: filter === t.id ? '1px solid var(--glass-border)' : '1px solid transparent',
            }}
          >
            {t.label}
            <span className="muted small" style={{ marginLeft: 4 }}>{t.count(requests)}</span>
          </button>
        ))}
        <div className="spacer" />
        <div className="row small muted"><span>Sort:</span> <b style={{ color: 'var(--ink-1)' }}>Newest</b></div>
      </div>

      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 28 }}><input type="checkbox" /></th>
            <th>Request</th>
            <th>Asset</th>
            <th>Requester</th>
            <th>Status</th>
            <th className="num">Amount</th>
            <th>Deadline</th>
            <th style={{ width: 36 }} />
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={8} className="muted small" style={{ textAlign: 'center', padding: 24 }}>No requests match this filter.</td></tr>
          )}
          {filtered.map(r => {
            const asset = assetMap[r.asset];
            return (
              <tr key={r.id}>
                <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                <td>
                  <Link href={`/requests/${r.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div className="row" style={{ gap: 8 }}>
                      {r.priority === 'high' && (
                        <span style={{ color: 'var(--bad)' }} title="High priority">{I.flag}</span>
                      )}
                      <div>
                        <div style={{ fontWeight: 500 }}>{r.title}</div>
                        <div className="id">
                          {r.id}
                          {r.attachments.length > 0 && <> · {r.attachments.length} {r.attachments.length === 1 ? 'file' : 'files'}</>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </td>
                <td>
                  <span className="chip">{I.truck}{asset?.name.split(' — ')[0] ?? r.asset}</span>
                </td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <Avatar name={r.requester} size={22} />
                    <span className="small">{r.requester}</span>
                  </div>
                </td>
                <td><Pill status={r.status} /></td>
                <td className="num">{r.currency} {r.amount.toLocaleString()}</td>
                <td className="muted small">{r.deadline}</td>
                <td>
                  <button className="btn ghost" style={{ padding: 4 }}>{I.more}</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
