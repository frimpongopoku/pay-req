import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { Avatar } from '@/components/ui/Avatar';
import { Pill } from '@/components/ui/Pill';
import { Spark } from '@/components/ui/Spark';
import { I } from '@/components/ui/icons';

export default async function DashboardPage() {
  const db = getDb();
  const currentUser = await getSessionUser();
  const orgId = currentUser?.orgId ?? '';
  const [requests, assets, activity, org] = await Promise.all([
    db.listRequests(orgId),
    db.listAssets(orgId),
    db.listActivity(orgId, 6),
    db.getOrg(orgId),
  ]);
  const orgCurrency = org?.currency ?? 'GHS';

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  const open = requests.filter(r => !['COMPLETED', 'DENIED'].includes(r.status));
  const awaitingReview = requests.filter(r => ['SUBMITTED', 'UNDER_REVIEW'].includes(r.status));
  const spendMTD = requests
    .filter(r => r.status !== 'DENIED')
    .reduce((sum, r) => sum + r.amount, 0);

  const kpis = [
    { label: 'Open requests',   value: String(open.length),           delta: `${awaitingReview.length} awaiting review`, spark: [4,6,5,7,9,8,11,10,12,11,open.length],  color: 'var(--brand)' },
    { label: 'Awaiting review', value: String(awaitingReview.length), delta: 'SLA 1.4 d',                                spark: [2,3,2,3,4,4,5,4,5,awaitingReview.length], color: 'var(--warn)' },
    { label: 'Spend (MTD)',     value: `${orgCurrency} ${spendMTD.toLocaleString()}`, delta: '+12% vs Apr',                            spark: [3,4,5,7,6,8,9,11,12,14,16,18,spendMTD/2000], color: 'var(--info)' },
    { label: 'Total requests',  value: String(requests.length),       delta: `${requests.filter(r=>r.status==='COMPLETED').length} completed`, spark: [3,4,5,5,6,6,7,7,8,requests.length], color: 'var(--good)' },
  ];

  const recent = [...requests]
    .sort((a, b) => b.submitted.localeCompare(a.submitted))
    .slice(0, 5);

  const reqsByAsset = requests.reduce<Record<string, typeof requests>>((acc, r) => {
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
            {awaitingReview.length} request{awaitingReview.length !== 1 ? 's' : ''} need your review
          </div>
        </div>
        <div className="spacer" />
        <button className="btn ghost">{I.download}Export</button>
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
        </div>
      </div>
    </div>
  );
}
