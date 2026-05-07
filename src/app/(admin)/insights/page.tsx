import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { Spark } from '@/components/ui/Spark';
import { I } from '@/components/ui/icons';
import type { Request, RequestStatus } from '@/lib/db';

const STATUS_COLORS: Record<RequestStatus, string> = {
  SUBMITTED:          '#94a3b8',
  UNDER_REVIEW:       '#f59e0b',
  APPROVED:           '#22c55e',
  PAID:               '#3b82f6',
  RECEIPTS_SUBMITTED: '#8b5cf6',
  COMPLETED:          '#14b8a6',
  DENIED:             '#ef4444',
};
const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under review', APPROVED: 'Approved',
  PAID: 'Paid', RECEIPTS_SUBMITTED: 'Receipts in', COMPLETED: 'Completed', DENIED: 'Denied',
};

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function Donut({ dist }: { dist: { k: string; v: number; c: string }[] }) {
  const total = dist.reduce((s, d) => s + d.v, 0);
  const R = 56, C = 70, S = 24;
  let acc = 0;
  const circ = 2 * Math.PI * R;
  const segs = dist.map(d => {
    const len = total ? (d.v / total) * circ : 0;
    const off = -acc;
    acc += len;
    return { ...d, len, off, gap: circ - len };
  });
  return (
    <svg width={C * 2} height={C * 2} style={{ flexShrink: 0 }}>
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth={S} />
      <g transform={`rotate(-90 ${C} ${C})`}>
        {segs.map((s, i) => (
          <circle key={i} cx={C} cy={C} r={R} fill="none"
            stroke={s.c} strokeWidth={S}
            strokeDasharray={`${s.len} ${s.gap}`}
            strokeDashoffset={s.off}
            strokeLinecap="butt" />
        ))}
      </g>
      <text x={C} y={C - 4} textAnchor="middle" fontSize="22" fontWeight="600" fill="var(--ink-0)" style={{ letterSpacing: '-0.02em' }}>{total}</text>
      <text x={C} y={C + 14} textAnchor="middle" fontSize="11" fill="var(--ink-3)">requests</text>
    </svg>
  );
}

function computeMonthlyBuckets(requests: Request[]) {
  const now = new Date();
  const buckets: { label: string; counts: Partial<Record<RequestStatus, number>> }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ label: MONTH_ABBR[d.getMonth()], counts: {} });
  }

  for (const r of requests) {
    const iso = r.submittedAt ?? null;
    if (!iso) continue;
    const d = new Date(iso);
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsAgo < 0 || monthsAgo > 5) continue;
    const bucket = buckets[5 - monthsAgo];
    bucket.counts[r.status] = (bucket.counts[r.status] ?? 0) + 1;
  }
  return buckets;
}

export default async function InsightsPage() {
  const db = getDb();
  const user = await getSessionUser();
  const orgId = user?.orgId ?? '';
  const [requests, assets, org] = await Promise.all([
    db.listRequests(orgId),
    db.listAssets(orgId),
    db.getOrg(orgId),
  ]);
  const orgCurrency = org?.currency ?? 'GHS';

  const total = requests.length;
  const approved = requests.filter(r => ['APPROVED','PAID','RECEIPTS_SUBMITTED','COMPLETED'].includes(r.status)).length;
  const approvalRate = total ? ((approved / total) * 100).toFixed(1) : '0';
  const spend = requests.filter(r => r.status !== 'DENIED').reduce((s, r) => s + r.amount, 0);

  const dist = (Object.keys(STATUS_COLORS) as RequestStatus[]).map(s => ({
    k: STATUS_LABELS[s],
    v: requests.filter(r => r.status === s).length,
    c: STATUS_COLORS[s],
  })).filter(d => d.v > 0);

  const assetSpend = assets.map(a => ({
    name: a.name.split(' — ')[0],
    spend: requests.filter(r => r.asset === a.id && r.status !== 'DENIED').reduce((s, r) => s + r.amount, 0),
  })).filter(a => a.spend > 0).sort((a, b) => b.spend - a.spend).slice(0, 5);
  const maxSpend = assetSpend[0]?.spend ?? 1;

  const monthly = computeMonthlyBuckets(requests);
  const STAGE_COLORS: Partial<Record<RequestStatus, string>> = {
    SUBMITTED: 'rgba(148,163,184,0.85)', UNDER_REVIEW: 'rgba(245,158,11,0.85)',
    APPROVED: 'rgba(34,197,94,0.85)', PAID: 'rgba(59,130,246,0.85)', COMPLETED: 'rgba(20,184,166,0.85)',
  };
  const MAX_H = Math.max(...monthly.map(b => Object.values(b.counts).reduce((s, v) => s + v, 0)), 1);

  const sparkTotal = monthly.map(b => Object.values(b.counts).reduce((s, v) => s + v, 0));
  const sparkRate  = monthly.map((b, i) => {
    const t = Object.values(b.counts).reduce((s, v) => s + v, 0);
    const a = (b.counts['APPROVED'] ?? 0) + (b.counts['PAID'] ?? 0) + (b.counts['RECEIPTS_SUBMITTED'] ?? 0) + (b.counts['COMPLETED'] ?? 0);
    return t ? Math.round((a / t) * 100) : (i > 0 ? sparkTotal[i - 1] : 0);
  });
  const sparkSpend = monthly.map(b =>
    Object.entries(b.counts).filter(([s]) => s !== 'DENIED').reduce((sum, [, v]) => sum + v, 0)
  );

  const kpis = [
    { l: 'Total requests',  v: String(total),       d: `${requests.filter(r=>r.status==='COMPLETED').length} completed`, s: sparkTotal,  c: 'var(--brand)' },
    { l: 'Approval rate',   v: `${approvalRate}%`,  d: `${approved} approved`,                                           s: sparkRate,   c: 'var(--good)' },
    { l: 'Spend total',     v: `${orgCurrency} ${spend.toLocaleString()}`, d: `${assets.length} assets`,                               s: sparkSpend,  c: 'var(--brand-2)' },
    { l: 'Open requests',   v: String(requests.filter(r=>!['COMPLETED','DENIED'].includes(r.status)).length), d: 'in progress', s: sparkTotal, c: 'var(--info)' },
  ];

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Insights</h1>
          <div className="muted small" style={{ marginTop: 4 }}>Trends across requests, assets and lifecycle stages</div>
        </div>
        <div className="spacer" />
        <button className="btn">{I.download}Export</button>
      </div>

      {/* KPI row */}
      <div className="grid g-4" style={{ marginBottom: 16 }}>
        {kpis.map((k, i) => (
          <div key={i} className="kpi glass">
            <div className="label">{k.l}</div>
            <div className="value">{k.v}</div>
            <div className="delta">{I.arrowUp}{k.d}</div>
            <div className="spark"><Spark data={k.s.length ? k.s : [0]} color={k.c} /></div>
          </div>
        ))}
      </div>

      <div className="grid g-2-1" style={{ marginBottom: 16 }}>
        {/* Monthly bar chart */}
        <div className="card glass">
          <div className="card-h">
            <h3>Requests over time</h3>
            <span className="sub">Last 6 months · stacked by stage</span>
            <div className="right row small" style={{ gap: 12 }}>
              {Object.entries(STAGE_COLORS).map(([k, c]) => (
                <span key={k} className="row" style={{ gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: c }} />
                  <span className="muted">{STATUS_LABELS[k as RequestStatus]}</span>
                </span>
              ))}
            </div>
          </div>
          {monthly.every(b => Object.keys(b.counts).length === 0) ? (
            <div className="muted small" style={{ padding: '24px 0' }}>No dated requests yet. New requests will appear here.</div>
          ) : (
            <div className="bars">
              {monthly.map((b, i) => {
                const t = Object.values(b.counts).reduce((s, v) => s + v, 0);
                return (
                  <div key={i} className="col">
                    <div className="stack">
                      {(Object.keys(STAGE_COLORS) as RequestStatus[]).reverse().map(k => {
                        const v = b.counts[k] ?? 0;
                        return v > 0 ? (
                          <div key={k} className="seg" style={{ height: (v / MAX_H * 100) + '%', background: STAGE_COLORS[k] }} />
                        ) : null;
                      })}
                    </div>
                    <div className="lab">{b.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-1)', marginTop: -4, fontVariantNumeric: 'tabular-nums' }}>{t || ''}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Donut */}
        <div className="card glass">
          <div className="card-h">
            <h3>Status distribution</h3>
            <span className="sub">All-time</span>
          </div>
          {dist.length === 0 ? (
            <div className="muted small">No requests yet.</div>
          ) : (
            <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
              <Donut dist={dist} />
              <div className="legend" style={{ flex: 1 }}>
                {dist.map(d => (
                  <div key={d.k} className="row">
                    <span className="sw" style={{ background: d.c }} />
                    <span className="lab">{d.k}</span>
                    <span className="val">{d.v} <span className="muted">· {Math.round(d.v / total * 100)}%</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spend by asset */}
      <div className="card glass">
        <div className="card-h">
          <h3>Spend by asset</h3>
          <span className="sub">All-time, excluding denied</span>
        </div>
        {assetSpend.length === 0 ? (
          <div className="muted small">No spend data yet.</div>
        ) : (
          <div className="col" style={{ gap: 10 }}>
            {assetSpend.map((a, i) => (
              <div key={i}>
                <div className="row small" style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{a.name}</span>
                  <span className="spacer" />
                  <span className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{orgCurrency} {a.spend.toLocaleString()}</span>
                </div>
                <div style={{ height: 10, background: 'rgba(15,23,42,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: Math.round(a.spend / maxSpend * 100) + '%', height: '100%', background: 'linear-gradient(90deg,var(--brand),var(--brand-2))', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
