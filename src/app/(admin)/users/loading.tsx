export default function UsersLoading() {
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <div className="skel" style={{ width: 110, height: 28, marginBottom: 10 }} />
          <div className="skel" style={{ width: 120, height: 14 }} />
        </div>
      </div>

      <div className="card glass" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              {[140, 80, 100, 80, 36].map((w, i) => (
                <th key={i}><div className="skel" style={{ width: w === 36 ? 0 : w, height: 12 }} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(7)].map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="row" style={{ gap: 10 }}>
                    <div className="skel" style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0 }} />
                    <div className="skel" style={{ width: 140, height: 14 }} />
                  </div>
                </td>
                <td><div className="skel" style={{ width: 70, height: 24, borderRadius: 999 }} /></td>
                <td><div className="skel" style={{ width: 90, height: 14 }} /></td>
                <td><div className="skel" style={{ width: 28, height: 14, marginLeft: 'auto' }} /></td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
