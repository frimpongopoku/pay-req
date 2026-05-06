// AssetFlow — Requests list view
function Requests({ goRequest, density }) {
  const { REQUESTS, ASSETS } = window.AF_DATA;
  const [filter, setFilter] = React.useState('all');
  const filtered = REQUESTS.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'open') return !['COMPLETED', 'DENIED'].includes(r.status);
    if (filter === 'mine') return ['UNDER_REVIEW', 'SUBMITTED'].includes(r.status);
    return r.status === filter;
  });

  const tabs = [
    { id: 'all',  label: 'All',         n: REQUESTS.length },
    { id: 'open', label: 'Open',        n: REQUESTS.filter(r => !['COMPLETED','DENIED'].includes(r.status)).length },
    { id: 'mine', label: 'Needs me',    n: 5 },
    { id: 'APPROVED', label: 'Approved', n: REQUESTS.filter(r => r.status === 'APPROVED').length },
    { id: 'PAID',     label: 'Paid',     n: REQUESTS.filter(r => r.status === 'PAID').length },
  ];

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Requests</h1>
          <div className="muted small" style={{ marginTop: 4 }}>Maintenance requests across all fleet assets</div>
        </div>
        <div className="spacer" />
        <button className="btn">{I.filter}Filters</button>
        <button className="btn">{I.download}Export CSV</button>
        <button className="btn primary">{I.plus}New request</button>
      </div>

      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px', borderBottom: '1px solid var(--line)' }}>
          {tabs.map(t => (
            <button key={t.id}
              onClick={() => setFilter(t.id)}
              className="btn ghost"
              style={{
                fontWeight: filter === t.id ? 600 : 400,
                color: filter === t.id ? 'var(--ink-0)' : 'var(--ink-2)',
                background: filter === t.id ? 'rgba(255,255,255,0.85)' : 'transparent',
                border: filter === t.id ? '1px solid var(--glass-border)' : '1px solid transparent',
              }}>
              {t.label}<span className="muted small" style={{ marginLeft: 4 }}>{t.n}</span>
            </button>
          ))}
          <div className="spacer" />
          <div className="row small muted">
            <span>Sort:</span> <b style={{ color: 'var(--ink-1)' }}>Newest</b>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 28 }}><input type="checkbox" /></th>
              <th>Request</th>
              <th>Asset</th>
              <th>Requester</th>
              <th>Status</th>
              <th className="num">Amount</th>
              <th>Deadline</th>
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const asset = ASSETS.find(a => a.id === r.asset);
              return (
                <tr key={r.id} onClick={() => goRequest(r.id)}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      {r.priority === 'high' && <span style={{ color: 'var(--bad)' }} title="High priority">{I.flag}</span>}
                      <div>
                        <div style={{ fontWeight: 500 }}>{r.title}</div>
                        <div className="id">{r.id}{r.attachments.length > 0 && <> · {r.attachments.length} {r.attachments.length === 1 ? 'file' : 'files'}</>}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="chip">{I.truck}{asset?.name.split(' — ')[0]}</span></td>
                  <td>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar name={r.requester} size={22} />
                      <span className="small">{r.requester}</span>
                    </div>
                  </td>
                  <td><Pill status={r.status} /></td>
                  <td className="num">${r.amount.toLocaleString()}</td>
                  <td className="muted small">{r.deadline}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn ghost" style={{ padding: 4 }}>{I.more}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.Requests = Requests;
