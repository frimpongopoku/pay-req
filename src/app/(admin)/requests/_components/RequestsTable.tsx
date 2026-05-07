'use client';
import { useState, useTransition, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Request, Asset } from '@/lib/db';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Pill';
import { I } from '@/components/ui/icons';
import { RowMenu } from '@/components/ui/RowMenu';
import { AmendRequestModal } from './AmendRequestModal';
import { deleteRequest } from '../actions';

type FilterId = 'all' | 'open' | 'mine' | 'APPROVED' | 'PAID';
const PAGE_SIZES = [10, 25, 50, 100];

const TABS: { id: FilterId; label: string; count: (r: Request[]) => number }[] = [
  { id: 'all',      label: 'All',      count: r => r.length },
  { id: 'open',     label: 'Open',     count: r => r.filter(x => !['COMPLETED','DENIED'].includes(x.status)).length },
  { id: 'mine',     label: 'Needs me', count: r => r.filter(x => x.status === 'SUBMITTED').length },
  { id: 'APPROVED', label: 'Approved', count: r => r.filter(x => x.status === 'APPROVED').length },
  { id: 'PAID',     label: 'Paid',     count: r => r.filter(x => x.status === 'PAID').length },
];

interface Props {
  requests: Request[];
  assetMap: Record<string, Asset>;
}

// ── Pagination helper ──────────────────────────────────────────────────────
function pageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

// ── CSV export ─────────────────────────────────────────────────────────────
function buildCSV(rows: Request[], assetMap: Record<string, Asset>) {
  const headers = ['ID','Title','Asset','Requester','Status','Amount','Currency','Deadline','Priority','Submitted'];
  const lines = rows.map(r => [
    r.id, r.title,
    assetMap[r.asset]?.name ?? r.asset,
    r.requester, r.status,
    r.amount, r.currency,
    r.deadline, r.priority,
    r.submitted,
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
  return [headers.join(','), ...lines].join('\n');
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── PDF export (print-to-PDF via new window) ───────────────────────────────
function printPDF(rows: Request[], assetMap: Record<string, Asset>, dateLabel: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  const totalSpend = rows.filter(r => r.status !== 'DENIED').reduce((s, r) => s + r.amount, 0);
  const currency = rows[0]?.currency ?? '';
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>PayReq Export</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,system-ui,sans-serif;font-size:12px;color:#0f172a;padding:32px}
    .hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;border-bottom:2px solid #6366f1;padding-bottom:14px}
    .hd h1{font-size:20px;font-weight:700;color:#6366f1}
    .hd .meta{font-size:11px;color:#64748b;margin-top:4px}
    .stats{display:flex;gap:24px;margin-bottom:18px}
    .stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 16px}
    .stat .val{font-size:16px;font-weight:700}
    .stat .lbl{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
    table{width:100%;border-collapse:collapse}
    thead th{background:#f1f5f9;padding:8px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#475569}
    tbody td{padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:11.5px}
    tbody tr:hover td{background:#fafafa}
    .pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600}
    .pill.COMPLETED{background:#d1fae5;color:#065f46}
    .pill.APPROVED{background:#dcfce7;color:#15803d}
    .pill.PAID{background:#dbeafe;color:#1d4ed8}
    .pill.SUBMITTED{background:#f1f5f9;color:#475569}
    .pill.DENIED{background:#fee2e2;color:#991b1b}
    .pill.RECEIPTS_SUBMITTED{background:#ede9fe;color:#5b21b6}
    .high{color:#dc2626;font-weight:600}
    .num{text-align:right;font-variant-numeric:tabular-nums}
    @media print{@page{margin:20mm}body{padding:0}}
  </style></head><body>
  <div class="hd">
    <div><h1>PayReq — Requests Export</h1>
    <div class="meta">${dateLabel} · ${rows.length} record${rows.length !== 1 ? 's' : ''} · Generated ${new Date().toLocaleString()}</div></div>
  </div>
  <div class="stats">
    <div class="stat"><div class="val">${rows.length}</div><div class="lbl">Total records</div></div>
    <div class="stat"><div class="val">${rows.filter(r => !['COMPLETED','DENIED'].includes(r.status)).length}</div><div class="lbl">Still open</div></div>
    <div class="stat"><div class="val">${rows.filter(r => r.status === 'COMPLETED').length}</div><div class="lbl">Completed</div></div>
    <div class="stat"><div class="val">${currency} ${totalSpend.toLocaleString()}</div><div class="lbl">Total spend</div></div>
  </div>
  <table>
    <thead><tr><th>ID</th><th>Title</th><th>Asset</th><th>Requester</th><th>Status</th><th class="num">Amount</th><th>Deadline</th><th>Priority</th><th>Submitted</th></tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td style="font-family:monospace;font-size:10.5px;color:#64748b">${r.id}</td>
      <td>${r.title}</td>
      <td>${assetMap[r.asset]?.name.split(' — ')[0] ?? r.asset}</td>
      <td>${r.requester}</td>
      <td><span class="pill ${r.status}">${r.status.replace('_',' ')}</span></td>
      <td class="num">${r.currency} ${r.amount.toLocaleString()}</td>
      <td>${r.deadline}</td>
      <td class="${r.priority === 'high' ? 'high' : ''}">${r.priority}</td>
      <td style="color:#64748b">${r.submitted}</td>
    </tr>`).join('')}</tbody>
  </table>
  <script>window.addEventListener('load',()=>{window.print();})</script>
  </body></html>`);
  win.document.close();
}

// ── Main component ─────────────────────────────────────────────────────────
export function RequestsTable({ requests, assetMap }: Props) {
  const router = useRouter();
  const [filter, setFilter]           = useState<FilterId>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [assetFilter, setAssetFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(25);
  const [amending, setAmending]       = useState<Request | null>(null);
  const [, startTransition]           = useTransition();

  // Unique assets + requesters for filter dropdowns
  const uniqueAssets = useMemo(() =>
    [...new Map(requests.map(r => [r.asset, assetMap[r.asset]])).entries()]
      .filter(([, a]) => a)
      .map(([id, a]) => ({ id, name: a!.name.split(' — ')[0] }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [requests, assetMap],
  );

  const activeFilterCount = [
    dateFrom, dateTo, assetFilter,
    priorityFilter.length > 0 ? 'x' : '',
  ].filter(Boolean).length;

  // Apply all filters
  const fullyFiltered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to   = dateTo   ? new Date(dateTo + 'T23:59:59').getTime() : null;
    return requests.filter(r => {
      // Tab filter
      if (filter === 'open' && ['COMPLETED','DENIED'].includes(r.status)) return false;
      if (filter === 'mine' && r.status !== 'SUBMITTED') return false;
      if (filter === 'APPROVED' && r.status !== 'APPROVED') return false;
      if (filter === 'PAID' && r.status !== 'PAID') return false;
      // Date range
      if (from || to) {
        const ts = r.submittedAt ? new Date(r.submittedAt).getTime() : null;
        if (!ts) return false;
        if (from && ts < from) return false;
        if (to   && ts > to)   return false;
      }
      // Asset
      if (assetFilter && r.asset !== assetFilter) return false;
      // Priority
      if (priorityFilter.length && !priorityFilter.includes(r.priority)) return false;
      return true;
    });
  }, [requests, filter, dateFrom, dateTo, assetFilter, priorityFilter]);

  // Reset to page 1 on any filter change
  useEffect(() => { setPage(1); }, [filter, dateFrom, dateTo, assetFilter, priorityFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(fullyFiltered.length / pageSize));
  const paginated  = fullyFiltered.slice((page - 1) * pageSize, page * pageSize);
  const startIdx   = fullyFiltered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx     = Math.min(page * pageSize, fullyFiltered.length);

  function clearFilters() {
    setDateFrom(''); setDateTo(''); setAssetFilter(''); setPriorityFilter([]);
  }

  function togglePriority(p: string) {
    setPriorityFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function handleExportCSV() {
    const dateLabel = dateFrom || dateTo
      ? `${dateFrom || 'start'} to ${dateTo || 'now'}`
      : 'all-time';
    downloadBlob(buildCSV(fullyFiltered, assetMap), `payreq-requests-${dateLabel}.csv`, 'text/csv');
  }

  function handleExportPDF() {
    const dateLabel = dateFrom || dateTo
      ? `${dateFrom || 'start'} to ${dateTo || 'now'}`
      : 'All time';
    printPDF(fullyFiltered, assetMap, dateLabel);
  }

  const pages = pageNumbers(page, totalPages);

  return (
    <>
      {amending && <AmendRequestModal request={amending} onClose={() => setAmending(null)} />}

      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>

        {/* ── Tab bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} className="btn ghost" style={{ fontWeight: filter === t.id ? 600 : 400, color: filter === t.id ? 'var(--ink-0)' : 'var(--ink-2)', background: filter === t.id ? 'rgba(255,255,255,0.85)' : 'transparent', border: filter === t.id ? '1px solid var(--glass-border)' : '1px solid transparent' }}>
              {t.label}
              <span className="muted small" style={{ marginLeft: 4 }}>{t.count(requests)}</span>
            </button>
          ))}
          <div className="spacer" />

          {/* Filters button */}
          <button
            className={'btn ghost' + (showFilters ? ' active' : '')}
            style={{ position: 'relative', background: showFilters ? 'rgba(99,102,241,0.08)' : undefined, borderColor: showFilters ? 'rgba(99,102,241,0.3)' : undefined, color: showFilters ? 'var(--brand)' : undefined }}
            onClick={() => setShowFilters(v => !v)}
          >
            {I.filter}Filters
            {activeFilterCount > 0 && (
              <span style={{ background: 'var(--brand)', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '0 5px', minWidth: 16, textAlign: 'center', lineHeight: '16px', display: 'inline-block' }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Export buttons */}
          <button className="btn ghost" onClick={handleExportCSV} title="Export filtered results as CSV">
            {I.download}CSV
          </button>
          <button className="btn ghost" onClick={handleExportPDF} title="Export filtered results as PDF">
            {I.download}PDF
          </button>
        </div>

        {/* ── Filter panel ── */}
        {showFilters && (
          <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.03)', borderBottom: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date from</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line-strong)', background: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'inherit', color: 'var(--ink-0)', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date to</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line-strong)', background: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'inherit', color: 'var(--ink-0)', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Asset</label>
              <select value={assetFilter} onChange={e => setAssetFilter(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line-strong)', background: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'inherit', color: 'var(--ink-0)', outline: 'none', minWidth: 160 }}>
                <option value="">All assets</option>
                {uniqueAssets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['high','🔴 High'],['med','🟡 Med'],['low','🟢 Low']].map(([val, lbl]) => (
                  <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1px solid ${priorityFilter.includes(val) ? 'var(--brand)' : 'var(--line-strong)'}`, background: priorityFilter.includes(val) ? 'var(--brand-soft)' : 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', userSelect: 'none' }}>
                    <input type="checkbox" checked={priorityFilter.includes(val)} onChange={() => togglePriority(val)} style={{ accentColor: 'var(--brand)', margin: 0 }} />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button className="btn ghost" onClick={clearFilters} style={{ alignSelf: 'flex-end', color: 'var(--bad)', borderColor: 'rgba(239,68,68,0.25)' }}>
                Clear filters
              </button>
            )}
            <div style={{ alignSelf: 'flex-end', marginLeft: 'auto', fontSize: 12.5, color: 'var(--ink-3)' }}>
              {fullyFiltered.length} record{fullyFiltered.length !== 1 ? 's' : ''} match
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 28 }}><input type="checkbox" /></th>
              <th>Request</th><th>Asset</th><th>Requester</th>
              <th>Status</th><th className="num">Amount</th><th>Deadline</th>
              <th style={{ width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr><td colSpan={8} className="muted small" style={{ textAlign: 'center', padding: 32 }}>
                {activeFilterCount > 0 ? 'No requests match the active filters.' : 'No requests match this filter.'}
              </td></tr>
            )}
            {paginated.map(r => {
              const asset = assetMap[r.asset];
              const isCompleted = r.status === 'COMPLETED';
              return (
                <tr
                  key={r.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/requests/${r.id}`)}
                >
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      {r.priority === 'high' && <span style={{ color: 'var(--bad)' }} title="High priority">{I.flag}</span>}
                      <div>
                        <div style={{ fontWeight: 500 }}>{r.title}</div>
                        <div className="id">{r.id}{r.attachments.length > 0 && <> · {r.attachments.length} file{r.attachments.length !== 1 ? 's' : ''}</>}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="chip">{I.truck}{asset?.name.split(' — ')[0] ?? r.asset}</span></td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar name={r.requester} size={22} />
                      <span className="small">{r.requester}</span>
                    </div>
                  </td>
                  <td><Pill status={r.status} /></td>
                  <td className="num">{r.currency} {r.amount.toLocaleString()}</td>
                  <td className="muted small">{r.deadline}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <RowMenu items={[
                      { label: 'Amend request', disabled: isCompleted, onClick: () => setAmending(r) },
                      { label: 'Delete request', danger: true, onClick: () => {
                        if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
                        startTransition(() => deleteRequest(r.id));
                      }},
                    ]} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── Pagination footer ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <span className="muted small" style={{ minWidth: 120 }}>
            {fullyFiltered.length === 0 ? 'No results' : `${startIdx}–${endIdx} of ${fullyFiltered.length}`}
          </span>
          <div className="spacer" />

          {/* Page buttons */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <button className="btn ghost" style={{ padding: '4px 8px', minWidth: 32 }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              {I.arrowDn /* reuse, rotated via CSS isn't easy, use text */}
              {'‹'}
            </button>
            {pages.map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} style={{ padding: '4px 6px', color: 'var(--ink-3)', fontSize: 13 }}>…</span>
              ) : (
                <button key={p} className="btn ghost" onClick={() => setPage(p as number)}
                  style={{ padding: '4px 8px', minWidth: 32, fontWeight: p === page ? 700 : 400, background: p === page ? 'var(--brand-soft)' : undefined, color: p === page ? 'var(--brand)' : undefined, border: p === page ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent' }}>
                  {p}
                </button>
              )
            )}
            <button className="btn ghost" style={{ padding: '4px 8px', minWidth: 32 }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              {'›'}
            </button>
          </div>

          {/* Page size */}
          <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
            style={{ padding: '5px 8px', borderRadius: 8, border: '1px solid var(--line-strong)', background: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontFamily: 'inherit', color: 'var(--ink-1)', outline: 'none' }}>
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} per page</option>)}
          </select>
        </div>
      </div>
    </>
  );
}
