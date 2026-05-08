import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import Link from 'next/link';
import { MI } from '@/components/ui/icons';
import { NavProgress } from '@/components/ui/NavProgress';


function TabBar() {
  return (
    <div className="m-tabs">
      <Link href="/m" className="tab">{MI.home}<span>Home</span></Link>
      <Link href="/m/requests" className="tab">{MI.inbox}<span>Requests</span></Link>
      <Link href="/m/create" className="fab">{MI.plus}</Link>
      <Link href="/m/updates" className="tab">{MI.msg}<span>Updates</span></Link>
      <Link href="/m/profile" className="tab">{MI.profile}<span>Me</span></Link>
    </div>
  );
}

export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/auth/signin');

  // No org yet — render bare so /m/pending can show its own full-screen UI
  // without causing an infinite redirect loop.
  if (!user.orgId) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-shell" style={{ minHeight: '100vh' }}>
      <NavProgress />
      <div className="m-body">
        <div className="m-content">{children}</div>
      </div>
      <TabBar />
    </div>
  );
}
