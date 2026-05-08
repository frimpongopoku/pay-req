import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { getOrgCache } from '@/lib/db/cached';
import { I } from '@/components/ui/icons';
import { CreateAssetModal } from './_components/CreateAssetModal';
import { AssetMenu } from './_components/AssetMenu';
import type { AssetType } from '@/lib/db/types';

const TYPE_ICON: Record<AssetType, keyof typeof I> = {
  car: 'car', building: 'building', device: 'device', machine: 'machine', other: 'package',
};
const TYPE_COLOR: Record<AssetType, string> = {
  car: '#6366f1', building: '#0ea5e9', device: '#8b5cf6', machine: '#f59e0b', other: '#64748b',
};

export default async function AssetsPage() {
  const user = await getSessionUser();
  const orgId = user?.orgId ?? '';
  const cache = getOrgCache(orgId);
  const [assets, requests, users, org] = await Promise.all([
    cache.listAssets(),
    cache.listRequests(),
    cache.listUsers(),
    cache.getOrg(),
  ]);
  const orgCurrency = org?.currency ?? 'GHS';
  const managers = users
    .filter((u) => u.role === 'Manager')
    .map((u) => ({ id: u.id, name: u.name, role: u.role }));

  const reqsByAsset = requests.reduce<Record<string, typeof requests>>((acc, r) => {
    (acc[r.asset] ??= []).push(r);
    return acc;
  }, {});

  const stats = Object.fromEntries(
    assets.map(a => {
      const aReqs = reqsByAsset[a.id] ?? [];
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
            {assets.length} asset{assets.length !== 1 ? 's' : ''} in your organisation
          </div>
        </div>
        <div className="spacer" />
        <CreateAssetModal managers={managers} />
      </div>

      {assets.length === 0 && (
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,var(--brand-soft),rgba(139,92,246,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🏗️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-0)' }}>No assets yet</div>
          <div className="muted small" style={{ maxWidth: 320, lineHeight: 1.6 }}>
            Assets are the things your team submits payment requests against — vehicles, buildings, devices, machines, or anything else. Add your first one to get started.
          </div>
          <div style={{ marginTop: 4 }}>
            <CreateAssetModal managers={managers} />
          </div>
        </div>
      )}

      <div className="grid g-3">
        {assets.map((a, i) => {
          const s = stats[a.id];
          return (
            <div key={a.id} className="card glass asset-card" style={{ animationDelay: `${i * 45}ms` }}>
              <div className="row" style={{ gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `linear-gradient(135deg, ${TYPE_COLOR[a.type ?? 'other']}22, ${TYPE_COLOR[a.type ?? 'other']}44)`,
                  border: `1px solid ${TYPE_COLOR[a.type ?? 'other']}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: TYPE_COLOR[a.type ?? 'other'], flexShrink: 0,
                }}>
                  {I[TYPE_ICON[a.type ?? 'other']]}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                    <div style={{ fontWeight: 500 }}>{a.name}</div>
                    {a.excluded && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '1px 7px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>Excluded</span>
                    )}
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                    {a.tag && <span className="chip" style={{ fontSize: 11 }}>{a.tag}</span>}
                    <span className="chip" style={{ fontSize: 11, textTransform: 'capitalize' }}>{a.type ?? 'other'}</span>
                    {a.tags?.map(t => <span key={t} className="chip" style={{ fontSize: 11, background: 'var(--brand-soft)', color: 'var(--brand)', borderColor: 'rgba(99,102,241,0.2)' }}>{t}</span>)}
                  </div>
                </div>
                <AssetMenu asset={a} managers={managers} />
              </div>
              <div className="grid g-2" style={{ gap: 8, fontSize: 12.5 }}>
                <div className="muted">Managers</div>
                <div style={{ textAlign: 'right' }}>{a.managers.join(', ')}</div>
                <div className="muted">Slack</div>
                <div style={{ textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                  {a.slack ? `#${a.slack}` : <span className="muted" style={{ fontFamily: 'inherit' }}>default</span>}
                </div>
                <div className="muted">Open requests</div>
                <div style={{ textAlign: 'right', fontWeight: 500 }}>{s.open}</div>
                <div className="muted">Total spend</div>
                <div style={{ textAlign: 'right', fontWeight: 500 }}>{orgCurrency} {s.spend.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
