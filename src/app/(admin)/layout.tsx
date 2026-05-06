import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect('/auth/signin');
  if (!user.orgId) redirect('/onboarding');
  if (user.role === 'Employee') redirect('/m');

  return (
    <>
      <div className="app-bg" />
      <div className="app">
        <Sidebar />
        <div className="main">
          <Topbar userName={user.name} />
          {children}
        </div>
      </div>
    </>
  );
}
