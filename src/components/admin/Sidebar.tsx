'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { I } from '@/components/ui/icons';
import { Avatar } from '@/components/ui/Avatar';

const navItems = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: I.chart },
  { id: 'requests',  href: '/requests',  label: 'Requests',  icon: I.inbox },
  { id: 'assets',    href: '/assets',    label: 'Assets',    icon: I.truck },
  { id: 'users',     href: '/users',     label: 'People',    icon: I.users },
  { id: 'insights',  href: '/insights',  label: 'Insights',  icon: I.chart },
];

const settingsItems = [
  { id: 'slack', href: '/settings/slack', label: 'Slack',        icon: I.slack },
  { id: 'org',   href: '/settings/org',  label: 'Organization', icon: I.settings },
];

export function Sidebar({
  orgName,
  userName,
  userRole,
  userDepot,
  userHue,
}: {
  orgName: string;
  userName: string;
  userRole: string;
  userDepot?: string;
  userHue: number;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <div className="brand-name">
          PayReq <span>·</span> <span>{orgName}</span>
        </div>
      </div>

      <div className="nav-section">Workspace</div>
      {navItems.map(item => (
        <Link
          key={item.id}
          href={item.href}
          className={'nav-item' + (isActive(item.href) ? ' active' : '')}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}

      <div className="nav-section">Settings</div>
      {settingsItems.map(item => (
        <Link
          key={item.id}
          href={item.href}
          className={'nav-item' + (isActive(item.href) ? ' active' : '')}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}

      <div className="org-card">
        <Avatar name={userName} size={30} hue={userHue} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            {userRole}{userDepot ? ` · ${userDepot}` : ''}
          </div>
        </div>
      </div>
      <div style={{ padding: '8px 12px 12px', fontSize: 10.5, color: 'var(--ink-4, var(--ink-3))', letterSpacing: '0.04em' }}>
        PayReq v{process.env.NEXT_PUBLIC_APP_VERSION ?? '—'}
      </div>
    </aside>
  );
}
