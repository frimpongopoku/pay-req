// AssetFlow — Insights, Slack settings, Assets, Users
function Insights() {
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const data = [
    { sub: 4, rev: 5, app: 6, paid: 4, comp: 9 },
    { sub: 6, rev: 7, app: 8, paid: 5, comp: 11 },
    { sub: 5, rev: 6, app: 9, paid: 7, comp: 12 },
    { sub: 8, rev: 9, app: 10, paid: 8, comp: 14 },
    { sub: 7, rev: 10, app: 11, paid: 9, comp: 16 },
    { sub: 9, rev: 8, app: 13, paid: 11, comp: 18 },
    { sub: 11, rev: 12, app: 14, paid: 9, comp: 8 },
  ];
  const colors = {
    sub: 'rgba(148,163,184,0.85)',
    rev: 'rgba(245,158,11,0.85)',
    app: 'rgba(34,197,94,0.85)',
    paid: 'rgba(59,130,246,0.85)',
    comp: 'rgba(20,184,166,0.85)',
  };
  const max = 65;

  // Donut data
  const dist = [
    { k: 'Submitted',   v: 11, c: '#94a3b8' },
    { k: 'Under review', v: 12, c: '#f59e0b' },
    { k: 'Approved',    v: 14, c: '#22c55e' },
    { k: 'Paid',        v: 9,  c: '#3b82f6' },
    { k: 'Receipts in', v: 6,  c: '#8b5cf6' },
    { k: 'Completed',   v: 18, c: '#14b8a6' },
    { k: 'Denied',      v: 4,  c: '#ef4444' },
  ];
  const total = dist.reduce((s, d) => s + d.v, 0);
  let acc = 0;
  const R = 56, C = 70, S = 24;
  const segs = dist.map(d => {
    const len = (d.v / total) * (2 * Math.PI * R);
    const off = -acc;
    acc += len;
    return { ...d, len, off, gap: 2 * Math.PI * R - len };
  });

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Insights</h1>
          <div className="muted small" style={{ marginTop: 4 }}>Trends across requests, assets and lifecycle stages</div>
        </div>
        <div className="spacer" />
        <button className="btn">{I.cal}Last 7 months</button>
        <button className="btn">{I.download}Export</button>
      </div>

      <div className="grid g-4" style={{ marginBottom: 16 }}>
        {[
          { l: 'Total requests',   v: '187',     d: '+18%', s: [12,14,16,18,21,24,28], c: 'var(--accent)' },
          { l: 'Approval rate',    v: '92.4%',   d: '+1.2pp', s: [88,89,90,91,91,92,92.4], c: 'var(--good)' },
          { l: 'Avg cycle time',   v: '2.6 d',   d: '−0.4 d', s: [3.4,3.2,3.0,2.9,2.8,2.7,2.6], c: 'var(--info)' },
          { l: 'Spend YTD',        v: '$148.2k', d: '+22%', s: [12,28,42,58,78,108,148], c: 'var(--accent-2)' },
        ].map((k, i) => (
          <div key={i} className="kpi glass">
            <div className="label">{k.l}</div>
            <div className="value">{k.v}</div>
            <div className="delta">{I.arrowUp}{k.d}</div>
            <div className="spark"><Spark data={k.s} color={k.c} /></div>
          </div>
        ))}
      </div>

      <div className="grid g-2-1" style={{ marginBottom: 16 }}>
        <div className="card glass">
          <div className="card-h">
            <h3>Requests over time</h3>
            <span className="sub">Stacked by lifecycle stage</span>
            <div className="right row small" style={{ gap: 12 }}>
              {Object.entries(colors).map(([k, c]) => (
                <span key={k} className="row" style={{ gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: c }} />
                  <span className="muted" style={{ textTransform: 'capitalize' }}>{k}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="bars">
            {data.map((d, i) => {
              const total = d.sub + d.rev + d.app + d.paid + d.comp;
              return (
                <div key={i} className="col">
                  <div className="stack">
                    {['comp', 'paid', 'app', 'rev', 'sub'].map(k => (
                      <div key={k} className="seg" style={{
                        height: (d[k] / max * 100) + '%',
                        background: colors[k],
                      }} />
                    ))}
                  </div>
                  <div className="lab">{months[i]}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-1)', marginTop: -4, fontVariantNumeric: 'tabular-nums' }}>{total}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>Status distribution</h3>
            <span className="sub">All-time</span>
          </div>
          <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
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
        </div>
      </div>

      <div className="grid g-2">
        <div className="card glass">
          <div className="card-h">
            <h3>Spend by asset class</h3>
            <span className="sub">YTD</span>
          </div>
          <div className="col" style={{ gap: 10 }}>
            {[
              { k: 'Long-haul trucks', v: 62400, p: 100, c: 'var(--accent)' },
              { k: 'Last-mile vans',   v: 38900, p: 62, c: 'var(--accent-2)' },
              { k: 'Reefer trailers',  v: 22100, p: 35, c: 'var(--info)' },
              { k: 'Yard equipment',   v: 14200, p: 23, c: 'var(--good)' },
              { k: 'Local box trucks', v: 10600, p: 17, c: 'var(--warn)' },
            ].map((d, i) => (
              <div key={i}>
                <div className="row small" style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{d.k}</span>
                  <span className="spacer" />
                  <span className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>${d.v.toLocaleString()}</span>
                </div>
                <div style={{ height: 10, background: 'rgba(15,23,42,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: d.p + '%', height: '100%', background: d.c, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>Time in stage</h3>
            <span className="sub">Median, last 30 days</span>
          </div>
          <div className="col" style={{ gap: 14 }}>
            {[
              { k: 'Submitted',         d: 0.4, w: 4 },
              { k: 'Under review',      d: 1.2, w: 12 },
              { k: 'Approved',          d: 0.8, w: 8 },
              { k: 'Paid',              d: 1.6, w: 16 },
              { k: 'Receipts pending',  d: 4.2, w: 42 },
              { k: 'Completed',         d: 0.2, w: 2 },
            ].map((d, i) => (
              <div key={i} className="row">
                <div style={{ width: 130, fontSize: 13 }}>{d.k}</div>
                <div style={{ flex: 1, height: 22, position: 'relative', background: 'rgba(15,23,42,0.04)', borderRadius: 6 }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: d.w + '%',
                    background: 'linear-gradient(90deg, rgba(99,102,241,0.7), rgba(139,92,246,0.7))',
                    borderRadius: 6,
                  }} />
                </div>
                <div style={{ width: 60, textAlign: 'right', fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{d.d} d</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlackSettings() {
  const { ASSETS } = window.AF_DATA;
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Slack notifications</h1>
          <div className="muted small" style={{ marginTop: 4 }}>Incoming webhooks, org-level fallback and per-asset overrides</div>
        </div>
        <div className="spacer" />
        <button className="btn">{I.link}Test webhook</button>
        <button className="btn primary">{I.check}Save changes</button>
      </div>

      <div className="grid g-2-1" style={{ marginBottom: 16 }}>
        <div className="card glass">
          <div className="card-h">
            <h3>Workspace connection</h3>
            <span className="sub">Northbound Freight · connected 14 days ago</span>
            <div className="right">
              <span className="pill approved"><span className="dot" />Connected</span>
            </div>
          </div>
          <div className="grid g-2" style={{ gap: 14 }}>
            <div className="field">
              <label>Default channel (org fallback)</label>
              <input type="text" defaultValue="#ops-requests" />
              <div className="hint">Used when an asset has no override and as a backup if the override fails.</div>
            </div>
            <div className="field">
              <label>Webhook URL</label>
              <input type="url" defaultValue="https://hooks.slack.com/services/T0••••••/B0••••••/••••••••••••••••" />
              <div className="hint">{I.copy}<span style={{ verticalAlign: 'middle' }}> Stored encrypted at rest.</span></div>
            </div>
          </div>
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 10 }}><h3 style={{ fontSize: 13 }}>Notify on events</h3></div>
          {[
            { k: 'New request',         d: 'When an employee submits a request', on: true },
            { k: 'Status changes',      d: 'Approval, denial, payment, completion', on: true },
            { k: 'Receipt submission',  d: 'When receipts are uploaded to a paid request', on: true },
            { k: 'Comments',            d: 'Replies and mentions on a request thread', on: false },
            { k: 'SLA breach',          d: 'When time-in-stage exceeds target', on: true },
          ].map((e, i) => (
            <div key={i} className="row" style={{ padding: '10px 0', borderTop: i ? '1px dashed var(--line)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{e.k}</div>
                <div className="muted small">{e.d}</div>
              </div>
              <div className="spacer" />
              <label className="switch">
                <input type="checkbox" defaultChecked={e.on} />
                <span className="track" />
                <span className="thumb" />
              </label>
            </div>
          ))}
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>Live preview</h3>
            <span className="sub">how it looks in Slack</span>
          </div>
          <div className="slack-msg">
            <div className="slack-h">
              <span className="name">AssetFlow</span>
              <span style={{ background: '#e8e8e8', padding: '0 4px', borderRadius: 3, fontSize: 10, color: '#616061' }}>APP</span>
              <span className="time">just now</span>
            </div>
            <div className="body">
              🛠 New maintenance request on <b>Truck 042</b><br />
              <b>Brake pad + rotor replacement</b>
            </div>
            <div className="fields">
              <div><div className="k">Amount</div><div className="v">$1,840 USD</div></div>
              <div><div className="k">Requester</div><div className="v">Tomás Reyes</div></div>
              <div><div className="k">Deadline</div><div className="v">May 9</div></div>
              <div><div className="k">Assigned to</div><div className="v">Maya Patel</div></div>
            </div>
            <div className="slack-actions">
              <button className="slack-btn primary">Approve</button>
              <button className="slack-btn">Deny</button>
              <button className="slack-btn">Open ↗</button>
            </div>
          </div>
          <div className="divider" />
          <div className="row small muted" style={{ gap: 8 }}>
            {I.flag}
            <span>If a Slack post fails, AssetFlow retries 3× then surfaces a banner on the request.</span>
          </div>
        </div>
      </div>

      <div className="card glass">
        <div className="card-h">
          <h3>Per-asset channel overrides</h3>
          <span className="sub">{ASSETS.filter(a => a.slack).length} of {ASSETS.length} assets override</span>
          <div className="right"><button className="btn ghost small">{I.plus}Add override</button></div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Tag</th>
              <th>Manager(s)</th>
              <th>Slack channel</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map(a => (
              <tr key={a.id}>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#cbd5e1,#64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{I.truck}</div>
                    <div style={{ fontWeight: 500 }}>{a.name}</div>
                  </div>
                </td>
                <td><span className="chip">{a.tag}</span></td>
                <td className="small">{a.managers.join(', ')}</td>
                <td>
                  {a.slack
                    ? <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, color: 'var(--accent)' }}>{a.slack}</span>
                    : <span className="muted small">↳ #ops-requests <i>(default)</i></span>}
                </td>
                <td>
                  {a.slack
                    ? <span className="pill approved"><span className="dot" />Override</span>
                    : <span className="pill submitted"><span className="dot" />Default</span>}
                </td>
                <td><button className="btn ghost" style={{ padding: 4 }}>{I.more}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Assets() {
  const { ASSETS } = window.AF_DATA;
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div><h1 className="h1">Assets</h1><div className="muted small" style={{ marginTop: 4 }}>Real-world fleet entities — trucks, trailers, yard equipment</div></div>
        <div className="spacer" />
        <button className="btn primary">{I.plus}New asset</button>
      </div>
      <div className="grid g-3">
        {ASSETS.map(a => (
          <div key={a.id} className="card glass">
            <div className="row" style={{ gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#cbd5e1,#64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{I.truck}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{a.name}</div>
                <div className="muted small">{a.tag}</div>
              </div>
              <button className="btn ghost" style={{ padding: 4 }}>{I.more}</button>
            </div>
            <div className="grid g-2" style={{ gap: 8, fontSize: 12.5 }}>
              <div className="muted">Managers</div>
              <div style={{ textAlign: 'right' }}>{a.managers.join(', ')}</div>
              <div className="muted">Slack</div>
              <div style={{ textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{a.slack || <span className="muted" style={{ fontFamily: 'inherit' }}>default</span>}</div>
              <div className="muted">Open requests</div>
              <div style={{ textAlign: 'right', fontWeight: 500 }}>{Math.floor(Math.random() * 3)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Users() {
  const users = [
    { name: 'Maya Patel',    role: 'Admin',   depot: 'East depot', n: 42, hue: 220 },
    { name: 'Diego Romero',  role: 'Manager', depot: 'Long-haul',  n: 28, hue: 30 },
    { name: 'Sam Whitt',     role: 'Manager', depot: 'Cold-chain', n: 19, hue: 180 },
    { name: 'Tomás Reyes',   role: 'Driver',  depot: 'East depot', n: 12, hue: 140 },
    { name: 'Aisha Khan',    role: 'Driver',  depot: 'Last-mile',  n: 9,  hue: 320 },
    { name: 'Bea Lindgren',  role: 'Driver',  depot: 'Cold-chain', n: 7,  hue: 60 },
    { name: 'Park Min-jun',  role: 'Driver',  depot: 'Long-haul',  n: 5,  hue: 260 },
  ];
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div><h1 className="h1">People</h1><div className="muted small" style={{ marginTop: 4 }}>Members of Northbound Freight</div></div>
        <div className="spacer" />
        <button className="btn primary">{I.plus}Invite</button>
      </div>
      <div className="card glass" style={{ padding: 0 }}>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Role</th><th>Depot</th><th className="num">Requests YTD</th><th></th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.name}>
                <td><div className="row" style={{ gap: 10 }}><Avatar name={u.name} size={30} hue={u.hue} /><div style={{ fontWeight: 500 }}>{u.name}</div></div></td>
                <td><span className="chip" style={{ background: u.role === 'Admin' ? 'var(--accent-soft)' : 'rgba(15,23,42,0.05)', color: u.role === 'Admin' ? 'var(--accent)' : 'var(--ink-2)', borderColor: 'transparent' }}>{u.role}</span></td>
                <td className="small">{u.depot}</td>
                <td className="num">{u.n}</td>
                <td><button className="btn ghost" style={{ padding: 4 }}>{I.more}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.Insights = Insights;
window.SlackSettings = SlackSettings;
window.Assets = Assets;
window.Users = Users;
