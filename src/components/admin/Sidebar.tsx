'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { I } from '@/components/ui/icons';
import { Avatar } from '@/components/ui/Avatar';

const navItems = [
  { id: 'dashboard', href: '/dashboard',        label: 'Dashboard',      icon: I.chart },
  { id: 'requests',  href: '/requests',          label: 'Requests',       icon: I.inbox, count: 14 },
  { id: 'assets',    href: '/assets',            label: 'Assets',         icon: I.truck, count: 8 },
  { id: 'users',     href: '/users',             label: 'People',         icon: I.users, count: 7 },
  { id: 'insights',  href: '/insights',          label: 'Insights',       icon: I.chart },
];

const settingsItems = [
  { id: 'slack', href: '/settings/slack', label: 'Slack',        icon: I.slack },
  { id: 'org',   href: '/settings/org',  label: 'Organization', icon: I.settings },
];

export function Sidebar() {
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
          PayReq <span>·</span> <span>Northbound Freight</span>
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
          {item.count != null && <span className="count">{item.count}</span>}
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
        <Avatar name="Maya Patel" size={30} hue={220} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Maya Patel
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Admin · East depot</div>
        </div>
      </div>
    </aside>
  );
}
