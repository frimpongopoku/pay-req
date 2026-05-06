import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { Avatar } from '@/components/ui/Avatar';
import { I } from '@/components/ui/icons';
import { InviteButton } from './_components/InviteModal';
import { RevokeButton } from './_components/RevokeButton';

export default async function UsersPage() {
  const db = getDb();
  const user = await getSessionUser();
  const orgId = user?.orgId ?? '';
  const [users, requests, invites, org] = await Promise.all([
    db.listUsers(orgId),
    db.listRequests(orgId),
    db.listInvites(orgId),
    orgId ? db.getOrg(orgId) : null,
  ]);

  // Count requests per requester name (requests store requester as a name string)
  const reqCountByName = requests.reduce<Record<string, number>>((acc, r) => {
    acc[r.requester] = (acc[r.requester] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">People</h1>
          <div className="muted small" style={{ marginTop: 4 }}>
            {users.length} members
          </div>
        </div>
        <div className="spacer" />
        <InviteButton orgName={org?.name ?? ''} />
      </div>

      <div className="card glass" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Depot</th>
              <th className="num">Requests YTD</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="row" style={{ gap: 10 }}>
                    <Avatar name={u.name} size={30} hue={u.hue} />
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                  </div>
                </td>
                <td>
                  <span
                    className="chip"
                    style={{
                      background: u.role === 'Admin' ? 'var(--accent-soft)' : 'rgba(15,23,42,0.05)',
                      color: u.role === 'Admin' ? 'var(--accent)' : 'var(--ink-2)',
                      borderColor: 'transparent',
                    }}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="small">{u.depot}</td>
                <td className="num">{reqCountByName[u.name] ?? 0}</td>
                <td><button className="btn ghost" style={{ padding: 4 }}>{I.more}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invites.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="row" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pending invites</h3>
            <span className="sub" style={{ marginLeft: 10 }}>{invites.length} awaiting sign-in</span>
          </div>
          <div className="card glass" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Invited by</th>
                  <th>Sent</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invites.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>{inv.email}</td>
                    <td>
                      <span
                        className="chip"
                        style={{
                          background: inv.role === 'Admin' ? 'var(--accent-soft)' : 'rgba(15,23,42,0.05)',
                          color: inv.role === 'Admin' ? 'var(--accent)' : 'var(--ink-2)',
                          borderColor: 'transparent',
                        }}
                      >
                        {inv.role}
                      </span>
                    </td>
                    <td className="small">{inv.invitedBy}</td>
                    <td className="muted small">{new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td><RevokeButton id={inv.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
