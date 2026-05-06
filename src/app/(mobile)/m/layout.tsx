import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import Link from 'next/link';
import { MI } from '@/components/ui/icons';

function StatusBar() {
  return (
    <div className="m-status">
      <span>9:41</span>
      <div className="right">
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3"/>
          <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor"/>
          <rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
}

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
  if (!user.orgId) redirect('/m/pending');

  return (
    <div className="mobile-shell" style={{ minHeight: '100vh' }}>
      <StatusBar />
      <div className="m-body">
        <div className="m-content">{children}</div>
      </div>
      <TabBar />
    </div>
  );
}
