// AssetFlow — Request detail (lifecycle in action)
function RequestDetail({ requestId, lifecycleStage, setLifecycleStage }) {
  const { REQUESTS, ASSETS } = window.AF_DATA;
  const r = REQUESTS.find(x => x.id === requestId) || REQUESTS[0];
  const asset = ASSETS.find(a => a.id === r.asset);

  const STAGES = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID', 'RECEIPTS_SUBMITTED', 'COMPLETED'];
  const stageIdx = lifecycleStage != null ? lifecycleStage : STAGES.indexOf(r.status);
  const currentStatus = stageIdx === -1 ? 'DENIED' : STAGES[stageIdx];
  const stageNames = ['Submitted', 'Under review', 'Approved', 'Paid', 'Receipts in', 'Completed'];
  const stageTimes = ['May 5, 09:14', 'May 5, 09:42', 'May 5, 14:08', 'May 6, 10:30', 'May 8, 16:22', 'May 9, 09:10'];

  const nextActions = {
    SUBMITTED:        { label: 'Move to review', primary: true },
    UNDER_REVIEW:     { label: 'Approve', primary: true, alt: 'Deny' },
    APPROVED:         { label: 'Mark as paid', primary: true },
    PAID:             { label: 'Awaiting receipts', primary: false },
    RECEIPTS_SUBMITTED: { label: 'Mark complete', primary: true },
    COMPLETED:        { label: 'Reopen', primary: false },
    DENIED:           { label: 'Reopen', primary: false },
  };
  const action = nextActions[currentStatus];

  const advance = () => setLifecycleStage(Math.min(STAGES.length - 1, stageIdx + 1));
  const rewind  = () => setLifecycleStage(Math.max(0, stageIdx - 1));

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <div className="row small muted" style={{ marginBottom: 6 }}>
            <span className="id">{r.id}</span>
            <span>·</span>
            <span>Submitted {r.submitted}</span>
            <span>·</span>
            <span className="row" style={{ gap: 4 }}>{I.cal}Due {r.deadline}</span>
          </div>
          <h1 className="h1">{r.title}</h1>
          <div className="row" style={{ gap: 8, marginTop: 8 }}>
            <Pill status={currentStatus} />
            <span className="chip">{I.truck}{asset.name}</span>
            <span className="chip">{asset.tag}</span>
            {r.priority === 'high' && <span className="pill denied"><span className="dot" />High priority</span>}
          </div>
        </div>
        <div className="spacer" />
        <button className="btn" onClick={rewind} disabled={stageIdx <= 0}>{I.arrowDn}Rewind stage</button>
        {action.alt && <button className="btn danger">{I.x}{action.alt}</button>}
        <button className={"btn " + (action.primary ? "primary" : "")} onClick={advance} disabled={stageIdx >= STAGES.length - 1}>
          {action.primary && I.check}{action.label}{!action.primary && I.arrowR}
        </button>
      </div>

      {/* Lifecycle stepper */}
      <div className="card glass" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
        <div className="stepper">
          {STAGES.map((s, i) => {
            const cls = i < stageIdx ? 'done' : (i === stageIdx ? 'current' : '');
            return (
              <div key={s} className={"step " + cls}>
                <div className="lbl">Step {i + 1}</div>
                <div className="name">{stageNames[i]}</div>
                <div className="ts">{i <= stageIdx ? stageTimes[i] : '—'}</div>
                <div className="marker" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid g-2-1">
        {/* Left column */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card glass">
            <div className="card-h"><h3>Request details</h3></div>
            <div className="grid g-2" style={{ gap: 18, fontSize: 13 }}>
              <div>
                <div className="muted small" style={{ marginBottom: 4 }}>Amount</div>
                <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                  ${r.amount.toLocaleString()}.00 <span className="muted" style={{ fontSize: 13, fontWeight: 400 }}>{r.currency}</span>
                </div>
              </div>
              <div>
                <div className="muted small" style={{ marginBottom: 4 }}>Payee</div>
                <div style={{ fontWeight: 500 }}>{r.payee}</div>
                <div className="muted small">Vendor · ACH</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="muted small" style={{ marginBottom: 4 }}>Purpose</div>
                <div style={{ lineHeight: 1.55 }}>{r.purpose}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="muted small" style={{ marginBottom: 4 }}>Additional details</div>
                <div className="muted" style={{ lineHeight: 1.55 }}>
                  Eastside Diesel quote attached. Vehicle will be off route for ~6 hours; backup unit 089 routed to cover the AM run.
                </div>
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="card-h">
              <h3>Attachments</h3>
              <span className="sub">{r.attachments.length} files</span>
              <div className="right">
                <button className="btn ghost small">{I.plus}Add</button>
              </div>
            </div>
            <div className="attach">
              {r.attachments.map((f, i) => {
                const isPdf = f.endsWith('.pdf');
                return (
                  <div key={i} className="a">
                    <div className="thumb">{isPdf ? 'PDF' : 'IMG'}</div>
                    <div className="name" title={f}>{f}</div>
                  </div>
                );
              })}
              {r.attachments.length === 0 && <div className="muted small">No attachments yet.</div>}
              <div className="a" style={{ opacity: 0.7 }}>
                <div className="thumb" style={{ borderStyle: 'dashed', background: 'rgba(255,255,255,0.5)' }}>{I.plus}</div>
                <div className="name">Drop files</div>
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="card-h">
              <h3>Discussion</h3>
              <span className="sub">3 comments · synced to Slack</span>
            </div>
            <div className="feed">
              <div className="item">
                <Avatar name="Maya Patel" size={28} hue={220} />
                <div className="body">
                  <b>Maya Patel</b> — Pulling rotor measurements from inspection log. Quote is ~5% above last service, asking Eastside for a line-item breakdown.
                  <div className="meta">via Slack · #fleet-east</div>
                </div>
                <div className="ts">12 min ago</div>
              </div>
              <div className="item">
                <Avatar name="Tomás Reyes" size={28} hue={140} />
                <div className="body">
                  <b>Tomás Reyes</b> — Confirmed pads at 2.4mm. Front-left rotor lipped. Photos attached.
                </div>
                <div className="ts">1 h ago</div>
              </div>
              <div className="item">
                <Avatar name="System" size={28} hue={280} />
                <div className="body">
                  <b>System</b> — Auto-assigned to <b>Maya Patel</b> as manager of <b>Truck 042</b>.
                  <div className="meta">Slack notification posted to #fleet-east</div>
                </div>
                <div className="ts">1 h ago</div>
              </div>
            </div>
            <div className="row" style={{ marginTop: 14, padding: 10, background: 'rgba(255,255,255,0.7)', border: '1px solid var(--line)', borderRadius: 12 }}>
              <Avatar name="Maya Patel" size={26} hue={220} />
              <input type="text" placeholder="Reply… (Slack-synced)" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13 }} />
              <button className="btn primary small">Send</button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card glass">
            <div className="card-h"><h3>Requester</h3></div>
            <div className="row" style={{ gap: 12 }}>
              <Avatar name={r.requester} size={42} hue={140} />
              <div>
                <div style={{ fontWeight: 500 }}>{r.requester}</div>
                <div className="muted small">Driver · East depot</div>
                <div className="muted small">8 prior requests · $4,210 ytd</div>
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="card-h"><h3>Asset</h3></div>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #cbd5e1, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                {I.truck}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{asset.name}</div>
                <div className="muted small">{asset.tag} · VIN ‧‧‧8421</div>
              </div>
            </div>
            <div className="divider" />
            <div className="grid g-2" style={{ gap: 8, fontSize: 12.5 }}>
              <div className="muted">Manager</div>
              <div style={{ textAlign: 'right' }}>{asset.managers.join(', ')}</div>
              <div className="muted">Slack channel</div>
              <div style={{ textAlign: 'right' }}>{asset.slack || <span className="muted">Org default</span>}</div>
              <div className="muted">YTD spend</div>
              <div style={{ textAlign: 'right' }}>$8,420</div>
              <div className="muted">Open requests</div>
              <div style={{ textAlign: 'right' }}>2</div>
            </div>
          </div>

          <div className="card glass">
            <div className="card-h">
              <h3>Slack notification</h3>
              <span className="sub">posted to {asset.slack || '#requests'}</span>
            </div>
            <div className="slack-msg">
              <div className="slack-h">
                <span className="name">AssetFlow</span>
                <span className="muted small" style={{ background: '#e8e8e8', padding: '0 4px', borderRadius: 3, fontSize: 10 }}>APP</span>
                <span className="time">9:14 AM</span>
              </div>
              <div className="body">
                🛠 New maintenance request on <b>{asset.name.split(' — ')[0]}</b><br />
                <b>{r.title}</b>
              </div>
              <div className="fields">
                <div><div className="k">Amount</div><div className="v">${r.amount.toLocaleString()} {r.currency}</div></div>
                <div><div className="k">Requester</div><div className="v">{r.requester}</div></div>
                <div><div className="k">Deadline</div><div className="v">{r.deadline}</div></div>
                <div><div className="k">Assigned to</div><div className="v">{asset.managers[0]}</div></div>
              </div>
              <div className="slack-actions">
                <button className="slack-btn primary">Approve</button>
                <button className="slack-btn">Deny</button>
                <button className="slack-btn">Open in AssetFlow ↗</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.RequestDetail = RequestDetail;
