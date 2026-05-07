export default function RequestsLoading() {
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <div className="skel" style={{ width: 130, height: 28, marginBottom: 10 }} />
          <div className="skel" style={{ width: 220, height: 14 }} />
        </div>
      </div>

      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--line)' }}>
          {[80, 65, 90, 80, 65].map((w, i) => (
            <div key={i} className="skel" style={{ width: w, height: 30, borderRadius: 8 }} />
          ))}
        </div>

        {/* Table */}
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 28 }}><div className="skel" style={{ width: 14, height: 14 }} /></th>
              <th><div className="skel" style={{ width: 80, height: 12 }} /></th>
              <th><div className="skel" style={{ width: 50, height: 12 }} /></th>
              <th><div className="skel" style={{ width: 80, height: 12 }} /></th>
              <th><div className="skel" style={{ width: 55, height: 12 }} /></th>
              <th><div className="skel" style={{ width: 65, height: 12, marginLeft: 'auto' }} /></th>
              <th><div className="skel" style={{ width: 65, height: 12 }} /></th>
              <th style={{ width: 36 }} />
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i}>
                <td><div className="skel" style={{ width: 14, height: 14 }} /></td>
                <td>
                  <div className="skel" style={{ width: '85%', height: 14, marginBottom: 6 }} />
                  <div className="skel" style={{ width: '55%', height: 11 }} />
                </td>
                <td><div className="skel" style={{ width: 90, height: 24, borderRadius: 999 }} /></td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <div className="skel" style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0 }} />
                    <div className="skel" style={{ width: 100, height: 13 }} />
                  </div>
                </td>
                <td><div className="skel" style={{ width: 80, height: 24, borderRadius: 999 }} /></td>
                <td><div className="skel" style={{ width: 90, height: 13, marginLeft: 'auto' }} /></td>
                <td><div className="skel" style={{ width: 65, height: 13 }} /></td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--line)' }}>
          <div className="skel" style={{ width: 120, height: 13 }} />
          <div style={{ flex: 1 }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skel" style={{ width: 32, height: 30, borderRadius: 8 }} />
          ))}
          <div className="skel" style={{ width: 100, height: 30, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}
