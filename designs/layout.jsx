// AssetFlow — Layout (sidebar + topbar + page chrome)
const { useState: useStateL } = React;

function Sidebar({ route, setRoute, counts }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard',     icon: I.chart },
    { id: 'requests',  label: 'Requests',      icon: I.inbox, count: counts.requests },
    { id: 'detail',    label: 'Request detail',icon: I.doc, indent: true, hidden: false },
    { id: 'assets',    label: 'Assets',        icon: I.truck, count: counts.assets },
    { id: 'users',     label: 'Users',         icon: I.users, count: counts.users },
    { id: 'insights',  label: 'Insights',      icon: I.chart },
  ];
  const settings = [
    { id: 'slack',     label: 'Slack',         icon: I.slack },
    { id: 'org',       label: 'Organization',  icon: I.settings },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <div className="brand-name">AssetFlow <span>·</span> <span>Northbound Freight</span></div>
      </div>

      <div className="nav-section">Workspace</div>
      {items.map(it => (
        <div key={it.id} className={"nav-item " + (route === it.id ? "active" : "") + (it.indent ? " indent" : "")}
             onClick={() => setRoute(it.id)}
             style={it.indent ? { marginLeft: 22, fontSize: 12.5 } : null}>
          {it.icon}
          <span>{it.label}</span>
          {it.count != null && <span className="count">{it.count}</span>}
        </div>
      ))}

      <div className="nav-section">Settings</div>
      {settings.map(it => (
        <div key={it.id} className={"nav-item " + (route === it.id ? "active" : "")}
             onClick={() => setRoute(it.id)}>
          {it.icon}<span>{it.label}</span>
        </div>
      ))}

      <div className="org-card">
        <Avatar name="Maya Patel" size={30} hue={220} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Maya Patel</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Admin · East depot</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ crumbs, actions }) {
  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'now' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="search">
        {I.search}
        <span>Search requests, assets, people…</span>
        <kbd>⌘ K</kbd>
      </div>
      {actions}
      <button className="btn ghost" title="Notifications" style={{ padding: 7 }}>{I.bell}</button>
    </div>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
