// AssetFlow — Dashboard view
function KPICard({ k }) {
  return (
    <div className="kpi glass">
      <div className="label">{k.label}</div>
      <div className="value">{k.value}</div>
      <div className={"delta " + (k.down ? "down" : "")}>
        {k.down ? I.arrowDn : I.arrowUp}{k.delta}
      </div>
      <div className="spark"><Spark data={k.spark} color={k.color} /></div>
    </div>
  );
}

function Dashboard({ goRequest, setRoute }) {
  const { REQUESTS, ACTIVITY, KPIS } = window.AF_DATA;
  const recent = REQUESTS.slice(0, 5);
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Good morning, Maya</h1>
          <div className="muted small" style={{ marginTop: 4 }}>5 requests need your review · 2 are past SLA</div>
        </div>
        <div className="spacer" />
        <button className="btn ghost">{I.download}Export</button>
        <button className="btn primary">{I.plus}New request</button>
      </div>

      <div className="grid g-4" style={{ marginBottom: 16 }}>
        {KPIS.map((k, i) => <KPICard key={i} k={k} />)}
      </div>

      <div className="grid g-2-1">
        <div className="card glass">
          <div className="card-h">
            <h3>Recent requests</h3>
            <span className="sub">Last 24 hours</span>
            <div className="right">
              <button className="btn ghost small" onClick={() => setRoute('requests')}>View all {I.arrowR}</button>
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
                const asset = window.AF_DATA.ASSETS.find(a => a.id === r.asset);
                return (
                  <tr key={r.id} onClick={() => goRequest(r.id)}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.title}</div>
                      <div className="id">{r.id} · {r.requester}</div>
                    </td>
                    <td className="muted small">{asset?.name.split(' — ')[0]}</td>
                    <td><Pill status={r.status} /></td>
                    <td className="num">${r.amount.toLocaleString()}</td>
                    <td className="muted small">{r.deadline}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>Activity</h3>
            <span className="sub">Live feed</span>
          </div>
          <div className="feed">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="item">
                <Avatar name={a.who} size={28} hue={a.avHue} />
                <div className="body"><b>{a.who}</b> {a.what}</div>
                <div className="ts">{a.ts}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid g-2" style={{ marginTop: 16 }}>
        <div className="card glass">
          <div className="card-h">
            <h3>Top assets by request volume</h3>
            <span className="sub">Last 30 days</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'Truck 042 — Freightliner M2', n: 8, spend: 4280 },
              { name: 'Truck 028 — Volvo VNL',       n: 6, spend: 3120 },
              { name: 'Trailer 14 — Reefer 53ft',    n: 5, spend: 1980 },
              { name: 'Van 117 — Mercedes Sprinter', n: 4, spend: 1640 },
              { name: 'Truck 051 — Kenworth T680',   n: 3, spend: 880 },
            ].map((a, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                  <div style={{ height: 6, marginTop: 6, borderRadius: 3, background: 'rgba(15,23,42,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: (a.n / 8 * 100) + '%', height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: 3 }} />
                  </div>
                </div>
                <div className="muted small num" style={{ fontVariantNumeric: 'tabular-nums' }}>{a.n} reqs</div>
                <div className="num" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>${a.spend.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>SLA performance</h3>
            <span className="sub">Time-in-stage by lifecycle</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
            {[
              { stage: 'Submitted → Review',      target: '24h', actual: '18h',  ok: true,  pct: 75 },
              { stage: 'Review → Approved',       target: '48h', actual: '36h',  ok: true,  pct: 75 },
              { stage: 'Approved → Paid',         target: '72h', actual: '52h',  ok: true,  pct: 72 },
              { stage: 'Paid → Receipts in',      target: '7 d',  actual: '5.2 d', ok: true, pct: 74 },
              { stage: 'Receipts → Completed',    target: '24h', actual: '38h',  ok: false, pct: 100 },
            ].map((s, i) => (
              <div key={i}>
                <div className="row" style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.stage}</div>
                  <div className="spacer" />
                  <div className="small muted">target {s.target}</div>
                  <div className="small" style={{ color: s.ok ? 'var(--good)' : 'var(--bad)', fontWeight: 600, marginLeft: 8 }}>{s.actual}</div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(15,23,42,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: s.pct + '%', height: '100%', borderRadius: 3,
                    background: s.ok ? 'linear-gradient(90deg, #34d399, #10b981)' : 'linear-gradient(90deg, #fb923c, #ef4444)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
