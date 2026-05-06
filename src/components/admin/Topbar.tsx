'use client';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase-client';
import { I } from '@/components/ui/icons';

function getCrumbMap(orgName: string): Record<string, string[]> {
  return {
    '/dashboard': [orgName, 'Dashboard'],
    '/requests': [orgName, 'Requests'],
    '/assets': [orgName, 'Assets'],
    '/users': [orgName, 'People'],
    '/insights': [orgName, 'Insights'],
    '/settings/slack': [orgName, 'Settings', 'Slack'],
    '/settings/org': [orgName, 'Settings', 'Organization'],
  };
}

function getCrumbs(pathname: string, orgName: string): string[] {
  if (pathname.startsWith('/requests/')) {
    const id = pathname.split('/')[2];
    return [orgName, 'Requests', id];
  }
  return getCrumbMap(orgName)[pathname] ?? ['PayReq'];
}

export function Topbar({ userName, orgName }: { userName?: string; orgName: string }) {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname, orgName);

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/signin';
  }

  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'now' : ''}>{c}</span>
          </span>
        ))}
      </div>
      <div className="search disabled" aria-disabled="true" title="Search coming soon">
        {I.search}
        <span>Search coming soon</span>
      </div>
      {userName && <span className="small muted" style={{ whiteSpace: 'nowrap' }}>{userName}</span>}
      <button className="btn ghost" onClick={handleSignOut} title="Sign out">{I.x}Sign out</button>
      <button className="btn ghost" title="Notifications" style={{ padding: 7 }}>{I.bell}</button>
    </div>
  );
}
