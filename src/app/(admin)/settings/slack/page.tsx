'use client';
import { useState } from 'react';
import { ASSETS } from '@/lib/data';
import { I } from '@/components/ui/icons';

const EVENTS = [
  { k: 'New request',        d: 'When an employee submits a request',                on: true },
  { k: 'Status changes',     d: 'Approval, denial, payment, completion',             on: true },
  { k: 'Receipt submission', d: 'When receipts are uploaded to a paid request',      on: true },
  { k: 'Comments',           d: 'Replies and mentions on a request thread',          on: false },
  { k: 'SLA breach',         d: 'When time-in-stage exceeds target',                 on: true },
];

export default function SlackSettingsPage() {
  const [events, setEvents] = useState(EVENTS.map(e => e.on));

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Slack notifications</h1>
          <div className="muted small" style={{ marginTop: 4 }}>
            Incoming webhooks, org-level fallback and per-asset overrides
          </div>
        </div>
        <div className="spacer" />
        <button className="btn">{I.link}Test webhook</button>
        <button className="btn primary">{I.check}Save changes</button>
      </div>

      <div className="grid g-2-1" style={{ marginBottom: 16 }}>
        {/* Config */}
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
              <div className="hint">{I.copy} Stored encrypted at rest.</div>
            </div>
          </div>
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 10 }}>
            <h3 style={{ fontSize: 13 }}>Notify on events</h3>
          </div>
          {EVENTS.map((e, i) => (
            <div key={i} className="row" style={{ padding: '10px 0', borderTop: i ? '1px dashed var(--line)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{e.k}</div>
                <div className="muted small">{e.d}</div>
              </div>
              <div className="spacer" />
              <label className="switch">
                <input
                  type="checkbox"
                  checked={events[i]}
                  onChange={() => setEvents(ev => ev.map((v, j) => j === i ? !v : v))}
                />
                <span className="track" />
                <span className="thumb" />
              </label>
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div className="card glass">
          <div className="card-h">
            <h3>Live preview</h3>
            <span className="sub">how it looks in Slack</span>
          </div>
          <div className="slack-msg">
            <div className="slack-h">
              <span className="name">PayReq</span>
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
            <span>If a Slack post fails, PayReq retries 3× then surfaces a banner on the request.</span>
          </div>
        </div>
      </div>

      {/* Per-asset overrides */}
      <div className="card glass">
        <div className="card-h">
          <h3>Per-asset channel overrides</h3>
          <span className="sub">{ASSETS.filter(a => a.slack).length} of {ASSETS.length} assets override</span>
          <div className="right">
            <button className="btn ghost small">{I.plus}Add override</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Asset</th><th>Tag</th><th>Manager(s)</th><th>Slack channel</th><th>Status</th><th />
            </tr>
          </thead>
          <tbody>
            {ASSETS.map(a => (
              <tr key={a.id}>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#cbd5e1,#64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      {I.truck}
                    </div>
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
