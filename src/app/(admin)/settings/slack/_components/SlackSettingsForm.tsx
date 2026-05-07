'use client';
import { useState, useTransition } from 'react';
import { I } from '@/components/ui/icons';
import { saveSlackSettings, sendTestWebhook } from '../actions';
import type { Organisation, Asset, SlackEvents } from '@/lib/db';

const DEFAULT_EVENTS: SlackEvents = {
  new_request: true,
  status_change: true,
  receipt_submission: true,
};

const EVENT_META = [
  { key: 'new_request'        as keyof SlackEvents, label: 'New request',        desc: 'When an employee submits a request' },
  { key: 'status_change'      as keyof SlackEvents, label: 'Status changes',     desc: 'Approval, denial, payment, completion' },
  { key: 'receipt_submission' as keyof SlackEvents, label: 'Receipt submission', desc: 'When receipts are uploaded to a paid request' },
];

interface Props {
  org: Organisation;
  assets: Asset[];
}

export default function SlackSettingsForm({ org, assets }: Props) {
  const events = { ...DEFAULT_EVENTS, ...(org.slackEvents ?? {}) };
  const [evts, setEvts] = useState(events);
  const [webhookVal, setWebhookVal] = useState(org.slackWebhook ?? '');
  const [testState, setTestState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [testError, setTestError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const connected = !!org.slackWebhook;

  async function handleTest() {
    if (!webhookVal) return;
    setTestState('loading');
    const result = await sendTestWebhook(webhookVal);
    setTestState(result.ok ? 'ok' : 'error');
    setTestError(result.error ?? '');
    setTimeout(() => setTestState('idle'), 4000);
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      await saveSlackSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form action={handleSave}>
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Slack notifications</h1>
          <div className="muted small" style={{ marginTop: 4 }}>
            Incoming webhook, event toggles and per-asset overrides
          </div>
        </div>
        <div className="spacer" />
        <button type="button" className="btn" onClick={handleTest} disabled={!webhookVal || testState === 'loading'}>
          {I.link}
          {testState === 'loading' ? 'Testing…' : testState === 'ok' ? 'Sent!' : testState === 'error' ? 'Failed' : 'Test webhook'}
        </button>
        <button type="submit" className="btn primary" disabled={pending}>
          {I.check}{saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>

      {testState === 'error' && testError && (
        <div className="card" style={{ marginBottom: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13 }}>
          Webhook test failed: {testError}
        </div>
      )}

      <div className="grid g-2-1" style={{ marginBottom: 16 }}>
        {/* Config */}
        <div className="card glass">
          <div className="card-h">
            <h3>Workspace connection</h3>
            <div className="right">
              {connected
                ? <span className="pill approved"><span className="dot" />Connected</span>
                : <span className="pill submitted"><span className="dot" />Not configured</span>}
            </div>
          </div>
          <div className="grid g-2" style={{ gap: 14 }}>
            <div className="field">
              <label>Default channel (org fallback)</label>
              <input type="text" name="channel" defaultValue={org.slackChannel ?? ''} placeholder="#ops-requests" />
              <div className="hint">For reference — notifications go to the webhook&apos;s fixed channel.</div>
            </div>
            <div className="field">
              <label>Webhook URL</label>
              <input
                type="url"
                name="webhook"
                value={webhookVal}
                onChange={e => setWebhookVal(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
              />
              <div className="hint">{I.copy} Stored encrypted at rest.</div>
            </div>
          </div>
          <div className="divider" />
          <div className="card-h" style={{ marginBottom: 10 }}>
            <h3 style={{ fontSize: 13 }}>Notify on events</h3>
          </div>
          {EVENT_META.map((e, i) => (
            <div key={e.key} className="row" style={{ padding: '10px 0', borderTop: i ? '1px dashed var(--line)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{e.label}</div>
                <div className="muted small">{e.desc}</div>
              </div>
              <div className="spacer" />
              <label className="switch">
                <input
                  type="checkbox"
                  name={`evt_${e.key}`}
                  checked={evts[e.key]}
                  onChange={() => setEvts(ev => ({ ...ev, [e.key]: !ev[e.key] }))}
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
            <h3>Message preview</h3>
            <span className="sub">how it looks in Slack</span>
          </div>
          <div className="slack-msg">
            <div className="slack-h">
              <span className="name">PayReq</span>
              <span style={{ background: '#e8e8e8', padding: '0 4px', borderRadius: 3, fontSize: 10, color: '#616061' }}>APP</span>
              <span className="time">just now</span>
            </div>
            <div className="body">
              📋 New request on <b>Truck 042</b><br />
              <b>Brake pad + rotor replacement</b>
            </div>
            <div className="fields">
              <div><div className="k">Amount</div><div className="v">GHS 1,840</div></div>
              <div><div className="k">Requester</div><div className="v">Tomás Reyes</div></div>
              <div><div className="k">Deadline</div><div className="v">May 9</div></div>
              <div><div className="k">Priority</div><div className="v">🔴 High</div></div>
            </div>
            <div className="slack-actions">
              <button type="button" className="slack-btn primary">Open in PayReq ↗</button>
            </div>
          </div>
          <div className="divider" />
          <div className="row small muted" style={{ gap: 8 }}>
            {I.flag}
            <span>Notifications fire on every enabled event. Failures are silently swallowed so they never block request actions.</span>
          </div>
        </div>
      </div>

      {/* Per-asset overrides */}
      <div className="card glass">
        <div className="card-h">
          <h3>Per-asset channel overrides</h3>
          <span className="sub">{assets.filter(a => a.slack).length} of {assets.length} assets have a channel set</span>
          <div className="right">
            <a href="/assets" className="btn ghost small">{I.arrowR}Manage in Assets</a>
          </div>
        </div>
        {assets.length === 0 ? (
          <div className="muted small" style={{ padding: '16px 0' }}>No assets yet.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Asset</th><th>Tag</th><th>Slack channel</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
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
                  <td>
                    {a.slack
                      ? <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, color: 'var(--brand)' }}>{a.slack}</span>
                      : <span className="muted small">not set</span>}
                  </td>
                  <td>
                    {a.slack
                      ? <span className="pill approved"><span className="dot" />Set</span>
                      : <span className="pill submitted"><span className="dot" />None</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </form>
  );
}
