import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
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
  const [user, db] = [await getSessionUser(), getDb()];
  const orgId = user?.orgId ?? '';
  const [allRequests, assets, org] = await Promise.all([
    db.listRequests(orgId),
    db.listAssets(orgId),
    db.getOrg(orgId),
  ]);
  const orgCurrency = org?.currency ?? 'GHS';

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  const myRequests = allRequests.filter(r =>
    r.requesterUid === user?.id || r.requester === user?.name
  );

  const recent = myRequests.slice(0, 3);
  const hero   = myRequests.find(r => !['COMPLETED','DENIED'].includes(r.status));
  const pendingReceipts = myRequests.find(r => r.status === 'PAID');

  const firstName = user?.name.split(' ')[0] ?? '';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      {/* Header */}
      <div className="m-header" style={{ marginTop: 12 }}>
        <div className="greet">
          <div className="hello">{today}</div>
          <div className="name">Hi, {firstName} 👋</div>
        </div>
        <div className="m-icon-btn">{MI.bell}</div>
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
        {pendingReceipts ? (
          <Link href={`/m/requests/${pendingReceipts.id}`} className="a alt" style={{ textDecoration: 'none' }}>
            <div className="ic-w">{MI.cam}</div>
            <div className="lbl">Upload receipt</div>
            <div className="sub">For {pendingReceipts.id}</div>
          </Link>
        ) : (
          <div className="a alt">
            <div className="ic-w">{MI.cam}</div>
            <div className="lbl">Upload receipt</div>
            <div className="sub">No pending receipts</div>
          </div>
        )}
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
