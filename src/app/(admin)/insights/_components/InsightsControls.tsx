'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { I } from '@/components/ui/icons';
import type { Request, Asset } from '@/lib/db';

interface Props {
  requests: Request[];
  assets: Asset[];
  currency: string;
  from: string;
  to: string;
  selectedAssets: string[];
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function InsightsControls({ requests, assets, currency, from, to, selectedAssets }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);
  const [localAssets, setLocalAssets] = useState<string[]>(selectedAssets);
  const [assetOpen, setAssetOpen] = useState(false);
  const assetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assetRef.current && !assetRef.current.contains(e.target as Node)) {
        setAssetOpen(false);
      }
    }
    if (assetOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [assetOpen]);

  function applyFilters() {
    const p = new URLSearchParams(params.toString());
    if (localFrom) p.set('from', localFrom); else p.delete('from');
    if (localTo) p.set('to', localTo); else p.delete('to');
    if (localAssets.length > 0) p.set('assets', localAssets.join(',')); else p.delete('assets');
    router.push(`/insights?${p.toString()}`);
    setAssetOpen(false);
  }

  function clearFilters() {
    setLocalFrom('');
    setLocalTo('');
    setLocalAssets([]);
    router.push('/insights');
  }

  function toggleAsset(id: string) {
    setLocalAssets(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleExportCSV() {
    const assetMap = Object.fromEntries(assets.map(a => [a.id, a.name.split(' — ')[0]]));
    const headers = ['ID', 'Title', 'Asset', 'Requester', 'Status', 'Amount', 'Currency', 'Priority', 'Submitted', 'Deadline'];
    const rows = requests.map(r => [
      r.id, r.title, assetMap[r.asset] ?? r.asset, r.requester,
      r.status, r.amount, r.currency, r.priority,
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : r.submitted,
      r.deadline,
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    downloadCSV(csv, `payreq-insights-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function handleExportPDF() {
    const assetMap = Object.fromEntries(assets.map(a => [a.id, a.name.split(' — ')[0]]));
    const total = requests.length;
    const approved = requests.filter(r => ['APPROVED','PAID','RECEIPTS_SUBMITTED','COMPLETED'].includes(r.status)).length;
    const denied = requests.filter(r => r.status === 'DENIED').length;
    const completed = requests.filter(r => r.status === 'COMPLETED').length;
    const spend = requests.filter(r => r.status !== 'DENIED').reduce((s, r) => s + r.amount, 0);
    const approvalRate = total ? ((approved / total) * 100).toFixed(1) : '0';

    const byAsset: Record<string, number> = {};
    for (const r of requests) {
      if (r.status === 'DENIED') continue;
      const name = assetMap[r.asset] ?? r.asset;
      byAsset[name] = (byAsset[name] ?? 0) + r.amount;
    }
    const topAssets = Object.entries(byAsset).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxSpend = topAssets[0]?.[1] ?? 1;

    const rangeLabel = (from && to)
      ? `${from} to ${to}`
      : from ? `From ${from}` : to ? `Up to ${to}` : 'All time';

    const assetLabel = selectedAssets.length > 0
      ? `${selectedAssets.length} asset${selectedAssets.length !== 1 ? 's' : ''} selected`
      : 'All assets';

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PayReq Insights</title><style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0f172a; padding: 40px; font-size: 13px; }
      h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
      .meta { color: #64748b; font-size: 12px; margin-bottom: 28px; }
      .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
      .kpi { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; }
      .kpi .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
      .kpi .value { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
      .kpi .sub { font-size: 11px; color: #94a3b8; margin-top: 3px; }
      h2 { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 12px; }
      .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
      .bar-row .name { width: 160px; font-size: 12.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .bar-row .track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
      .bar-row .fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px; }
      .bar-row .amt { width: 100px; text-align: right; font-size: 12px; font-variant-numeric: tabular-nums; color: #334155; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
      td { padding: 6px 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
      @media print { body { padding: 24px; } }
    </style></head><body>
      <h1>PayReq — Insights Report</h1>
      <div class="meta">Generated ${new Date().toLocaleString()} · Period: ${rangeLabel} · ${assetLabel} · ${total} requests</div>
      <div class="kpis">
        <div class="kpi"><div class="label">Total requests</div><div class="value">${total}</div><div class="sub">${completed} completed</div></div>
        <div class="kpi"><div class="label">Approval rate</div><div class="value">${approvalRate}%</div><div class="sub">${approved} approved</div></div>
        <div class="kpi"><div class="label">Total spend</div><div class="value">${currency} ${spend.toLocaleString()}</div><div class="sub">excl. denied</div></div>
        <div class="kpi"><div class="label">Denied</div><div class="value">${denied}</div><div class="sub">of ${total} total</div></div>
      </div>
      ${topAssets.length > 0 ? `
      <h2>Spend by Asset</h2>
      ${topAssets.map(([name, amt]) => `
        <div class="bar-row">
          <div class="name">${name}</div>
          <div class="track"><div class="fill" style="width:${Math.round(amt / maxSpend * 100)}%"></div></div>
          <div class="amt">${currency} ${amt.toLocaleString()}</div>
        </div>`).join('')}` : ''}
      <table>
        <thead><tr><th>ID</th><th>Title</th><th>Asset</th><th>Requester</th><th>Status</th><th>Amount</th><th>Submitted</th></tr></thead>
        <tbody>
          ${requests.map(r => `<tr>
            <td style="font-family:monospace;font-size:11px">${r.id}</td>
            <td>${r.title}</td>
            <td>${assetMap[r.asset] ?? r.asset}</td>
            <td>${r.requester}</td>
            <td>${r.status}</td>
            <td style="text-align:right;font-variant-numeric:tabular-nums">${r.currency} ${r.amount.toLocaleString()}</td>
            <td>${r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : r.submitted}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </body></html>`;

    const w = window.open('', '_blank', 'width=960,height=700');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  }

  const hasFilters = !!(from || to || selectedAssets.length > 0);
  const assetLabel = localAssets.length === 0
    ? 'All assets'
    : localAssets.length === 1
      ? (assets.find(a => a.id === localAssets[0])?.name.split(' — ')[0] ?? '1 asset')
      : `${localAssets.length} assets`;

  return (
    <div className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {/* Asset picker */}
      <div ref={assetRef} style={{ position: 'relative' }}>
        <button
          className={'btn ghost' + (localAssets.length > 0 ? ' active' : '')}
          style={localAssets.length > 0 ? { background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.3)', color: 'var(--brand)' } : {}}
          onClick={() => setAssetOpen(v => !v)}
        >
          {I.truck}{assetLabel}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ marginLeft: 2, opacity: 0.5 }}>
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {assetOpen && (
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50, minWidth: 220, maxHeight: 280, overflowY: 'auto', background: 'white', border: '1px solid var(--line)', borderRadius: 10, boxShadow: '0 4px 24px rgba(15,23,42,0.12)', padding: 6 }}>
            <div style={{ padding: '4px 8px 8px', borderBottom: '1px solid var(--line)', marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filter by asset</div>
              {localAssets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLocalAssets([])}
                  style={{ fontSize: 11, color: 'var(--bad)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 3, fontFamily: 'inherit' }}
                >
                  Clear selection
                </button>
              )}
            </div>
            {assets.map(a => (
              <label
                key={a.id}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, cursor: 'pointer', fontSize: 13, userSelect: 'none', background: localAssets.includes(a.id) ? 'var(--brand-soft)' : 'transparent' }}
              >
                <input
                  type="checkbox"
                  checked={localAssets.includes(a.id)}
                  onChange={() => toggleAsset(a.id)}
                  style={{ accentColor: 'var(--brand)', margin: 0, flexShrink: 0 }}
                />
                <span style={{ flex: 1, fontWeight: localAssets.includes(a.id) ? 500 : 400, color: localAssets.includes(a.id) ? 'var(--brand)' : 'var(--ink-0)' }}>
                  {a.name.split(' — ')[0]}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Date range */}
      <input
        type="date" value={localFrom} onChange={e => setLocalFrom(e.target.value)}
        style={{ padding: '6px 10px', fontSize: 13, borderRadius: 8, border: '1px solid var(--line)', background: 'white', fontFamily: 'inherit', cursor: 'pointer', color: localFrom ? 'var(--ink-0)' : 'var(--ink-3)' }}
        title="From date"
      />
      <span className="muted small">—</span>
      <input
        type="date" value={localTo} onChange={e => setLocalTo(e.target.value)}
        style={{ padding: '6px 10px', fontSize: 13, borderRadius: 8, border: '1px solid var(--line)', background: 'white', fontFamily: 'inherit', cursor: 'pointer', color: localTo ? 'var(--ink-0)' : 'var(--ink-3)' }}
        title="To date"
      />

      <button className="btn ghost" onClick={applyFilters}>{I.check}Apply</button>
      {hasFilters && <button className="btn ghost" onClick={clearFilters} style={{ color: 'var(--bad)' }}>{I.x}Clear</button>}
      <button className="btn ghost" onClick={handleExportCSV}>{I.download}CSV</button>
      <button className="btn ghost" onClick={handleExportPDF}>{I.download}PDF</button>
    </div>
  );
}
