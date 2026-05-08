import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { getOrgCache } from '@/lib/db/cached';
import { Avatar } from '@/components/ui/Avatar';
import { I } from '@/components/ui/icons';
import { InviteButton } from './_components/InviteModal';
import { RevokeButton } from './_components/RevokeButton';
import { CopyInviteButton } from './_components/CopyInviteButton';
import { UserMenu } from './_components/UserMenu';

export default async function UsersPage() {
  const user = await getSessionUser();
  const orgId = user?.orgId ?? '';
  const cache = getOrgCache(orgId);
  const [users, requests, invites, org] = await Promise.all([
    cache.listUsers(),
    cache.listRequests(),
    cache.listInvites(),
    cache.getOrg(),
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
                      background: u.role === 'Admin' ? 'var(--brand-soft)' : 'rgba(15,23,42,0.05)',
                      color: u.role === 'Admin' ? 'var(--brand)' : 'var(--ink-2)',
                      borderColor: 'transparent',
                    }}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="small">{u.depot}</td>
                <td className="num">{reqCountByName[u.name] ?? 0}</td>
                <td>{u.id !== user?.id && <UserMenu userId={u.id} currentRole={u.role} isSelf={false} />}</td>
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
                          background: inv.role === 'Admin' ? 'var(--brand-soft)' : 'rgba(15,23,42,0.05)',
                          color: inv.role === 'Admin' ? 'var(--brand)' : 'var(--ink-2)',
                          borderColor: 'transparent',
                        }}
                      >
                        {inv.role}
                      </span>
                    </td>
                    <td className="small">{inv.invitedBy}</td>
                    <td className="muted small">{new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td>
                      <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                        <CopyInviteButton email={inv.email} role={inv.role} orgName={org?.name ?? ''} />
                        <RevokeButton id={inv.id} />
                      </div>
                    </td>
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
