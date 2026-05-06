import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { getDb } from '@/lib/db';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect('/auth/signin');
  if (!user.orgId) redirect('/onboarding');
  if (user.role === 'Employee') redirect('/m');
  const org = await getDb().getOrg(user.orgId);
  const orgName = org?.name ?? 'Your Organization';

  return (
    <>
      <div className="app-bg" />
      <div className="app">
        <Sidebar orgName={orgName} userName={user.name} userRole={user.role} userDepot={user.depot} userHue={user.hue} />
        <div className="main">
          <Topbar userName={user.name} orgName={orgName} />
          {children}
        </div>
      </div>
    </>
  );
}
