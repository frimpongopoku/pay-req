import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { I } from '@/components/ui/icons';
import { CreateAssetModal } from './_components/CreateAssetModal';

export default async function AssetsPage() {
  const db = getDb();
  const user = await getSessionUser();
  const orgId = user?.orgId ?? '';
  const [assets, requests, users] = await Promise.all([
    db.listAssets(orgId),
    db.listRequests(orgId),
    db.listUsers(orgId),
  ]);
  const managers = users
    .filter((u) => u.role === 'Admin' || u.role === 'Manager')
    .map((u) => ({ id: u.id, name: u.name, role: u.role }));

  const stats = Object.fromEntries(
    assets.map(a => {
      const aReqs = requests.filter(r => r.asset === a.id);
      const open  = aReqs.filter(r => !['COMPLETED', 'DENIED'].includes(r.status)).length;
      const spend = aReqs.filter(r => r.status !== 'DENIED').reduce((s, r) => s + r.amount, 0);
      return [a.id, { open, spend, total: aReqs.length }];
    })
  );

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Assets</h1>
          <div className="muted small" style={{ marginTop: 4 }}>
            {assets.length} fleet entities · trucks, trailers, yard equipment
          </div>
        </div>
        <div className="spacer" />
        <CreateAssetModal managers={managers} />
      </div>

      <div className="grid g-3">
        {assets.map((a, i) => {
          const s = stats[a.id];
          return (
            <div key={a.id} className="card glass asset-card" style={{ animationDelay: `${i * 45}ms` }}>
              <div className="row" style={{ gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#cbd5e1,#64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                  {I.truck}
                </div>
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
                <div style={{ textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                  {a.slack ?? <span className="muted" style={{ fontFamily: 'inherit' }}>default</span>}
                </div>
                <div className="muted">Open requests</div>
                <div style={{ textAlign: 'right', fontWeight: 500 }}>{s.open}</div>
                <div className="muted">Total spend</div>
                <div style={{ textAlign: 'right', fontWeight: 500 }}>${s.spend.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
