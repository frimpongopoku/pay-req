import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { PendingSignOut } from './_components/PendingSignOut';

export default async function PendingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/auth/signin');
  if (user.orgId) redirect('/m');

  return (
    <>
      <div className="app-bg" />
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
          <h1 className="h1" style={{ marginBottom: 10 }}>Not added yet</h1>
          <div className="muted" style={{ lineHeight: 1.6, marginBottom: 24 }}>
            Hi <b>{user.name.split(' ')[0]}</b> — your account exists but you haven't been added to an organisation yet.
            <br /><br />
            Ask your fleet manager or admin to add you to their PayReq organisation, then sign in again.
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <PendingSignOut />
          </div>
        </div>
      </div>
    </>
  );
}
