'use client';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase-client';
import { I } from '@/components/ui/icons';

const crumbMap: Record<string, string[]> = {
  '/dashboard':     ['Northbound Freight', 'Dashboard'],
  '/requests':      ['Northbound Freight', 'Requests'],
  '/assets':        ['Northbound Freight', 'Assets'],
  '/users':         ['Northbound Freight', 'People'],
  '/insights':      ['Northbound Freight', 'Insights'],
  '/settings/slack':['Northbound Freight', 'Settings', 'Slack'],
  '/settings/org':  ['Northbound Freight', 'Settings', 'Organization'],
};

function getCrumbs(pathname: string): string[] {
  if (pathname.startsWith('/requests/')) {
    const id = pathname.split('/')[2];
    return ['Northbound Freight', 'Requests', id];
  }
  return crumbMap[pathname] ?? ['PayReq'];
}

export function Topbar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname);

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
      <div className="search">
        {I.search}
        <span>Search requests, assets, people…</span>
        <kbd>⌘ K</kbd>
      </div>
      {userName && <span className="small muted" style={{ whiteSpace: 'nowrap' }}>{userName}</span>}
      <button className="btn ghost" onClick={handleSignOut} title="Sign out">{I.x}Sign out</button>
      <button className="btn ghost" title="Notifications" style={{ padding: 7 }}>{I.bell}</button>
    </div>
  );
}
