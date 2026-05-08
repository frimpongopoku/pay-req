import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { getOrgCache } from '@/lib/db/cached';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Pill';
import { Spark } from '@/components/ui/Spark';
import { I } from '@/components/ui/icons';

export default async function DashboardPage() {
  const currentUser = await getSessionUser();
  const orgId = currentUser?.orgId ?? '';
  const cache = getOrgCache(orgId);
  const [requests, assets, activity, org] = await Promise.all([
    cache.listRequests(),
    cache.listAssets(),
    cache.listActivity(6),
    cache.getOrg(),
  ]);
  const orgCurrency = org?.currency ?? 'GHS';

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  const active = requests.filter(r => !r.excluded);
  const open = active.filter(r => !['COMPLETED', 'DENIED'].includes(r.status));
  const awaitingReview = active.filter(r => r.status === 'SUBMITTED');
  const spendMTD = active
    .filter(r => r.status !== 'DENIED')
    .reduce((sum, r) => sum + r.amount, 0);

  const completedCount = active.filter(r => r.status === 'COMPLETED').length;
  const kpis = [
    { label: 'Open requests',   value: String(open.length),           delta: `${awaitingReview.length} awaiting review`, spark: [0, open.length],            color: 'var(--brand)' },
    { label: 'Awaiting review', value: String(awaitingReview.length), delta: 'needs attention',                          spark: [0, awaitingReview.length],   color: 'var(--warn)' },
    { label: 'Spend (MTD)',     value: `${orgCurrency} ${spendMTD.toLocaleString()}`, delta: 'all non-denied requests',  spark: [0, Math.max(spendMTD, 1)],   color: 'var(--info)' },
    { label: 'Total requests',  value: String(requests.length),       delta: `${completedCount} completed`,              spark: [0, Math.max(requests.length, 1)], color: 'var(--good)' },
  ];

  const recent = [...active]
    .sort((a, b) => b.submitted.localeCompare(a.submitted))
    .slice(0, 5);

  const needsReview      = active.filter(r => r.status === 'SUBMITTED');
  const awaitingReceipts = active.filter(r => r.status === 'PAID');

  const reqsByAsset = active.reduce<Record<string, typeof active>>((acc, r) => {
    if (r.status !== 'DENIED') (acc[r.asset] ??= []).push(r);
    return acc;
  }, {});

  const assetStats = assets.map(a => {
    const aReqs = reqsByAsset[a.id] ?? [];
    return { name: a.name, n: aReqs.length, spend: aReqs.reduce((s, r) => s + r.amount, 0) };
  }).filter(a => a.n > 0).sort((a, b) => b.n - a.n).slice(0, 5);
  const maxN = assetStats[0]?.n ?? 1;

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Good morning{currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''}</h1>
          <div className="muted small" style={{ marginTop: 4 }}>
            {awaitingReview.length} request{awaitingReview.length !== 1 ? 's' : ''} need{awaitingReview.length === 1 ? 's' : ''} your review
          </div>
        </div>
        <div className="spacer" />
        <Link href="/requests/new" className="btn primary">{I.plus}New request</Link>
      </div>

      {/* KPI row */}
      <div className="grid g-4" style={{ marginBottom: 16 }}>
        {kpis.map((k, i) => (
          <div key={i} className="kpi glass">
            <div className="label">{k.label}</div>
            <div className="value">{k.value}</div>
            <div className="delta">{I.arrowUp}{k.delta}</div>
            <div className="spark"><Spark data={k.spark} color={k.color} /></div>
          </div>
        ))}
      </div>

      {/* Action items */}
      {(needsReview.length > 0 || awaitingReceipts.length > 0) && (
        <div className="card glass" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
          <div className="card-h" style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--line)' }}>
            <h3>Action required</h3>
            <span className="sub">{needsReview.length + awaitingReceipts.length} item{(needsReview.length + awaitingReceipts.length) !== 1 ? 's' : ''} need{(needsReview.length + awaitingReceipts.length) === 1 ? 's' : ''} attention</span>
          </div>

          {needsReview.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px 6px', background: 'rgba(245,158,11,0.05)' }}>
                <span style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--warn)', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b45309' }}>Needs review</span>
                <span style={{ fontSize: 11.5, background: 'rgba(245,158,11,0.18)', color: '#b45309', padding: '1px 7px', borderRadius: 999, fontWeight: 600 }}>{needsReview.length}</span>
              </div>
              {needsReview.map(r => (
                <Link key={r.id} href={`/requests/${r.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="action-row-warn">
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.title}</div>
                      <div className="id" style={{ marginTop: 2 }}>{r.id} · {r.requester}</div>
                    </div>
                    <span className="chip" style={{ fontSize: 11.5 }}>{assetMap[r.asset]?.name.split(' — ')[0]}</span>
                    <Pill status={r.status} />
                    <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-1)', fontWeight: 500 }}>{r.currency} {r.amount.toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Due {r.deadline}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {awaitingReceipts.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px 6px', background: 'rgba(14,165,233,0.05)' }}>
                <span style={{ width: 3, height: 16, borderRadius: 2, background: 'var(--info)', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0369a1' }}>Awaiting receipts</span>
                <span style={{ fontSize: 11.5, background: 'rgba(14,165,233,0.18)', color: '#0369a1', padding: '1px 7px', borderRadius: 999, fontWeight: 600 }}>{awaitingReceipts.length}</span>
              </div>
              {awaitingReceipts.map(r => (
                <Link key={r.id} href={`/requests/${r.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="action-row-info">
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.title}</div>
                      <div className="id" style={{ marginTop: 2 }}>{r.id} · {r.requester}</div>
                    </div>
                    <span className="chip" style={{ fontSize: 11.5 }}>{assetMap[r.asset]?.name.split(' — ')[0]}</span>
                    <Pill status={r.status} />
                    <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-1)', fontWeight: 500 }}>{r.currency} {r.amount.toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Due {r.deadline}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid g-2-1">
        {/* Recent requests */}
        <div className="card glass">
          <div className="card-h">
            <h3>Recent requests</h3>
            <span className="sub">{requests.length} total</span>
            <div className="right">
              <Link href="/requests" className="btn ghost small">View all {I.arrowR}</Link>
            </div>
          </div>
          {recent.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '36px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 36, opacity: 0.2 }}>📋</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-1)' }}>No requests yet</div>
              <div className="muted small" style={{ maxWidth: 260 }}>Once your team starts submitting payment requests, they'll appear here.</div>
              <Link href="/requests/new" className="btn primary" style={{ marginTop: 4 }}>{I.plus}Create first request</Link>
            </div>
          ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Request</th><th>Asset</th><th>Status</th>
                <th className="num">Amount</th><th>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(r => {
                const asset = assetMap[r.asset];
                return (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/requests/${r.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <div style={{ fontWeight: 500 }}>{r.title}</div>
                        <div className="id">{r.id} · {r.requester}</div>
                      </Link>
                    </td>
                    <td className="muted small">{asset?.name.split(' — ')[0]}</td>
                    <td><Pill status={r.status} /></td>
                    <td className="num">{r.currency} {r.amount.toLocaleString()}</td>
                    <td className="muted small">{r.deadline}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>

        {/* Activity feed */}
        <div className="card glass">
          <div className="card-h">
            <h3>Activity</h3>
            <span className="sub">Live feed</span>
          </div>
          <div className="feed">
            {activity.length === 0 && (
              <div className="muted small" style={{ padding: '12px 0' }}>No activity yet.</div>
            )}
            {activity.map((a) => (
              <div key={a.id} className="item">
                <Avatar name={a.who} size={28} hue={a.avHue} />
                <div className="body">
                  <b>{a.who}</b> {a.what}
                </div>
                <div className="ts">{a.ts}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid g-2" style={{ marginTop: 16 }}>
        {/* Top assets */}
        <div className="card glass">
          <div className="card-h">
            <h3>Top assets by request volume</h3>
            <span className="sub">All time</span>
          </div>
          {assetStats.length === 0 ? (
            <div className="muted small">No data yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {assetStats.map((a, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px', gap: 12, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                    <div style={{ height: 6, marginTop: 6, borderRadius: 3, background: 'rgba(15,23,42,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: (a.n / maxN * 100) + '%', height: '100%', background: 'linear-gradient(90deg, var(--brand), var(--brand-2))', borderRadius: 3 }} />
                    </div>
                  </div>
                  <div className="muted small num" style={{ fontVariantNumeric: 'tabular-nums' }}>{a.n} reqs</div>
                  <div className="num" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{orgCurrency} {a.spend.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SLA performance */}
        <div className="card glass">
          <div className="card-h">
            <h3>SLA performance</h3>
            <span className="sub">Time-in-stage by lifecycle</span>
          </div>
          {completedCount === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '28px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, opacity: 0.25 }}>⏱</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-1)' }}>No data yet</div>
              <div className="muted small">SLA metrics will appear once requests have been completed.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
              {[
                { stage: 'Submitted → Review',   target: '24h',  actual: '18h',   ok: true,  pct: 75 },
                { stage: 'Review → Approved',    target: '48h',  actual: '36h',   ok: true,  pct: 75 },
                { stage: 'Approved → Paid',      target: '72h',  actual: '52h',   ok: true,  pct: 72 },
                { stage: 'Paid → Receipts in',   target: '7 d',  actual: '5.2 d', ok: true,  pct: 74 },
                { stage: 'Receipts → Completed', target: '24h',  actual: '38h',   ok: false, pct: 100 },
              ].map((s, i) => (
                <div key={i}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.stage}</div>
                    <div className="spacer" />
                    <div className="small muted">target {s.target}</div>
                    <div className="small" style={{ color: s.ok ? 'var(--good)' : 'var(--bad)', fontWeight: 600, marginLeft: 8 }}>{s.actual}</div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(15,23,42,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: s.pct + '%', height: '100%', borderRadius: 3, background: s.ok ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#fb923c,#ef4444)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
