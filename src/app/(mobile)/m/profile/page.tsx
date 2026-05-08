import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { MI } from '@/components/ui/icons';
import { SignOutButton } from './_components/SignOutButton';

export default async function MobileProfilePage() {
  const [user, db] = [await getSessionUser(), getDb()];
  const orgId = user?.orgId ?? '';
  const [allRequests, org] = await Promise.all([
    db.listRequests(orgId),
    db.getOrg(orgId),
  ]);
  const orgCurrency = org?.currency ?? 'GHS';

  const mine = allRequests.filter(r =>
    r.requesterUid === user?.id || r.requester === user?.name
  );
  const open      = mine.filter(r => !['COMPLETED','DENIED'].includes(r.status)).length;
  const completed = mine.filter(r => r.status === 'COMPLETED').length;
  const spend     = mine.reduce((s, r) => s + r.amount, 0);

  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <>
      <div className="m-header" style={{ marginTop: 8 }}>
        <div className="av" style={{ width: 48, height: 48, borderRadius: 14 }}>{initials}</div>
        <div className="greet">
          <div className="hello">{user?.role} · {user?.depot || 'No depot'}</div>
          <div className="name" style={{ fontSize: 24 }}>{user?.name ?? 'Unknown'}</div>
          {org && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5, padding: '3px 10px', borderRadius: 999, background: 'var(--m-accent-soft)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <span style={{ fontSize: 10, color: 'var(--m-accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{org.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="m-sec"><h3>Overview</h3></div>
      <div className="m-req-list">
        <div className="m-card">
          <div className="small" style={{ color: 'var(--m-ink-2)' }}>Total requests</div>
          <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{mine.length}</div>
        </div>
        <div className="m-card">
          <div className="small" style={{ color: 'var(--m-ink-2)' }}>Open</div>
          <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{open}</div>
        </div>
        <div className="m-card">
          <div className="small" style={{ color: 'var(--m-ink-2)' }}>Completed</div>
          <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{completed}</div>
        </div>
      </div>

      <div className="m-card">
        <h4>Spend to date</h4>
        <div style={{ fontSize: 30, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {orgCurrency} {spend.toLocaleString()}
        </div>
        <div className="small" style={{ color: 'var(--m-ink-2)', marginTop: 6 }}>
          Across all your submitted requests
        </div>
      </div>

      <div className="m-card">
        <h4>Account</h4>
        <div style={{ display: 'grid', gap: 8, fontSize: 13, color: 'var(--m-ink-2)' }}>
          <div>{user?.email}</div>
          <div>{user?.role}{user?.depot ? ` · ${user.depot}` : ''}</div>
          {org && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4, borderTop: '1px solid var(--m-line)' }}>
              <span style={{ color: 'var(--m-ink-3)', fontSize: 12 }}>Organisation</span>
              <span style={{ marginLeft: 'auto', fontWeight: 500, color: 'var(--m-ink-0)' }}>{org.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="m-card">
        <h4>Support</h4>
        <div className="small" style={{ color: 'var(--m-ink-2)', lineHeight: 1.5 }}>
          For payment issues or urgent route-impacting requests, contact fleet ops.
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <button className="btn" style={{ justifyContent: 'flex-start' }}>{MI.msg}Message ops</button>
          <SignOutButton />
        </div>
      </div>

      <div style={{ paddingBottom: 16, textAlign: 'center', fontSize: 11, color: 'var(--m-ink-3)', letterSpacing: '0.04em' }}>
        PayReq v{process.env.NEXT_PUBLIC_APP_VERSION ?? '—'}
      </div>

      <div style={{ height: 100 }} />
    </>
  );
}
