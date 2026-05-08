import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { getOrgCache } from '@/lib/db/cached';
import { MPill } from '@/components/ui/Pill';
import { MI } from '@/components/ui/icons';

const STAGES = ['SUBMITTED','APPROVED','PAID','RECEIPTS_SUBMITTED','COMPLETED'];

function StagesMini({ stage, total = 6 }: { stage: number; total?: number }) {
  return (
    <div className="stages-mini">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={'s' + (i < stage ? ' done' : i === stage ? ' cur' : '')} />
      ))}
    </div>
  );
}

export default async function MobileHomePage() {
  const user = await getSessionUser();
  if (!user?.orgId) redirect('/m/pending');
  const orgId = user.orgId;
  const cache = getOrgCache(orgId);
  const [allRequests, assets, org] = await Promise.all([
    cache.listRequests(),
    cache.listAssets(),
    cache.getOrg(),
  ]);
  const orgCurrency = org?.currency ?? 'GHS';

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  const myRequests = allRequests
    .filter(r => r.requesterUid === user?.id || r.requester === user?.name)
    .sort((a, b) => (b.submittedAt ?? b.submitted).localeCompare(a.submittedAt ?? a.submitted));

  const recent = myRequests.slice(0, 3);
  const hero   = myRequests.find(r => !['COMPLETED','DENIED'].includes(r.status));

  const firstName = user?.name.split(' ')[0] ?? '';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      {/* Header */}
      <div className="m-header" style={{ marginTop: 12 }}>
        <div className="greet">
          <div className="hello">{today}</div>
          <div className="name">Hi, {firstName} 👋</div>
          {org && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5, padding: '3px 10px', borderRadius: 999, background: 'var(--m-accent-soft)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <span style={{ fontSize: 10, color: 'var(--m-accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{org.name}</span>
            </div>
          )}
        </div>
        {/* Notifications — not yet implemented
        <div className="m-icon-btn">{MI.bell}</div> */}
      </div>

      {/* Hero — most recent active request */}
      {hero ? (
        <Link href={`/m/requests/${hero.id}`} style={{ textDecoration: 'none' }}>
          <div className="m-hero">
            <div className="lab">{hero.status.replace('_', ' ').toLowerCase()} · {myRequests.filter(r => !['COMPLETED','DENIED'].includes(r.status)).length} open</div>
            <div className="title">{hero.title}</div>
            <div className="sub">{assetMap[hero.asset]?.name.split(' — ')[0]} · {hero.currency} {hero.amount.toLocaleString()}</div>
            <div className="m-hero-row">
              <MPill status={hero.status} />
              <span style={{ marginLeft: 'auto', opacity: 0.85 }}>due {hero.deadline}</span>
            </div>
          </div>
        </Link>
      ) : (
        <div className="m-hero">
          <div className="lab">All clear</div>
          <div className="title">No open requests</div>
          <div className="sub">Submit a new request whenever you need it.</div>
        </div>
      )}

      {/* Quick actions */}
      <div className="m-sec"><h3>Quick actions</h3></div>
      <div className="m-quick">
        <Link href="/m/create" className="a" style={{ textDecoration: 'none' }}>
          <div className="ic-w">{MI.plus}</div>
          <div className="lbl">New request</div>
          <div className="sub">Repair, parts, service</div>
        </Link>
        <Link href="/m/requests" className="a alt" style={{ textDecoration: 'none' }}>
          <div className="ic-w">{MI.inbox}</div>
          <div className="lbl">My requests</div>
          <div className="sub">{myRequests.length} total</div>
        </Link>
      </div>

      {/* Recent requests */}
      {recent.length > 0 && (
        <>
          <div className="m-sec">
            <h3>Your requests</h3>
            <Link href="/m/requests" className="more" style={{ textDecoration: 'none' }}>See all →</Link>
          </div>
          <div className="m-req-list">
            {recent.map(r => {
              const stage = STAGES.indexOf(r.status === 'UNDER_REVIEW' ? 'SUBMITTED' : r.status);
              return (
                <Link key={r.id} href={`/m/requests/${r.id}`} style={{ textDecoration: 'none' }}>
                  <div className="m-req">
                    <div className="top">
                      <span className="id">{r.id}</span>
                      <MPill status={r.status} />
                      <span className="spacer" />
                      {r.priority === 'high' && <span style={{ fontSize: 11.5, color: 'var(--m-bad)' }}>{MI.flag}</span>}
                    </div>
                    <div className="ttl">{r.title}</div>
                    <StagesMini stage={stage >= 0 ? stage : 0} />
                    <div className="meta">
                      <span>{assetMap[r.asset]?.name.split(' — ')[0]}</span>
                      <span>·</span>
                      <span><b>{r.currency} {r.amount.toLocaleString()}</b></span>
                      <span>·</span>
                      <span>Due {r.deadline}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {myRequests.length === 0 && (
        <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--m-ink-3)', fontSize: 13 }}>
          No requests yet. Tap + to create your first one.
        </div>
      )}
    </>
  );
}
