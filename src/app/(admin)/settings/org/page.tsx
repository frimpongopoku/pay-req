import { I } from '@/components/ui/icons';

export default function OrgSettingsPage() {
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Organization</h1>
          <div className="muted small" style={{ marginTop: 4 }}>Manage your workspace settings</div>
        </div>
        <div className="spacer" />
        <button className="btn primary">{I.check}Save changes</button>
      </div>

      <div className="grid g-2">
        <div className="card glass">
          <div className="card-h"><h3>Workspace details</h3></div>
          <div className="col" style={{ gap: 16 }}>
            <div className="field">
              <label>Organization name</label>
              <input type="text" defaultValue="" placeholder="Your organization name" />
            </div>
            <div className="field">
              <label>Industry</label>
              <input type="text" defaultValue="Logistics & Transportation" />
            </div>
            <div className="field">
              <label>Default currency</label>
              <input type="text" defaultValue="USD" />
            </div>
            <div className="field">
              <label>Timezone</label>
              <input type="text" defaultValue="America/Los_Angeles (PST)" />
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h"><h3>Approval settings</h3></div>
          <div className="col" style={{ gap: 16 }}>
            <div className="field">
              <label>Auto-assign to asset managers</label>
              <div className="row" style={{ marginTop: 4 }}>
                <span className="muted small">When a request is submitted, auto-assign to the asset's managers</span>
                <div className="spacer" />
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="track" /><span className="thumb" />
                </label>
              </div>
            </div>
            <div className="divider" />
            <div className="field">
              <label>Fallback to admins</label>
              <div className="row" style={{ marginTop: 4 }}>
                <span className="muted small">If asset has no manager, assign to org admins</span>
                <div className="spacer" />
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="track" /><span className="thumb" />
                </label>
              </div>
            </div>
            <div className="divider" />
            <div className="field">
              <label>SLA — Review deadline (hours)</label>
              <input type="text" defaultValue="24" />
            </div>
            <div className="field">
              <label>SLA — Approval deadline (hours)</label>
              <input type="text" defaultValue="48" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
