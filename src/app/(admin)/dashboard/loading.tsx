export default function DashboardLoading() {
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <div className="skel" style={{ width: 280, height: 28, marginBottom: 10 }} />
          <div className="skel" style={{ width: 200, height: 14 }} />
        </div>
      </div>

      <div className="grid g-4" style={{ marginBottom: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="kpi glass">
            <div className="skel" style={{ width: '55%', height: 12, marginBottom: 10 }} />
            <div className="skel" style={{ width: '75%', height: 32, marginBottom: 10 }} />
            <div className="skel" style={{ width: '65%', height: 10 }} />
          </div>
        ))}
      </div>

      <div className="grid g-2-1" style={{ marginBottom: 16 }}>
        <div className="card glass" style={{ minHeight: 280 }}>
          <div className="card-h" style={{ marginBottom: 16 }}>
            <div className="skel" style={{ width: 140, height: 16 }} />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', gap: 12 }}>
              <div style={{ flex: 2 }}>
                <div className="skel" style={{ width: '80%', height: 13, marginBottom: 6 }} />
                <div className="skel" style={{ width: '50%', height: 11 }} />
              </div>
              <div className="skel" style={{ width: 70, height: 22, borderRadius: 999 }} />
              <div className="skel" style={{ width: 80, height: 13 }} />
            </div>
          ))}
        </div>
        <div className="card glass" style={{ minHeight: 280 }}>
          <div className="card-h" style={{ marginBottom: 16 }}>
            <div className="skel" style={{ width: 80, height: 16 }} />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="row" style={{ padding: '10px 0', gap: 10 }}>
              <div className="skel" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skel" style={{ width: '70%', height: 12, marginBottom: 5 }} />
                <div className="skel" style={{ width: '40%', height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid g-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card glass" style={{ minHeight: 200 }}>
            <div className="card-h" style={{ marginBottom: 16 }}>
              <div className="skel" style={{ width: 160, height: 16 }} />
            </div>
            {[...Array(4)].map((_, j) => (
              <div key={j} style={{ marginBottom: 16 }}>
                <div className="skel" style={{ width: '60%', height: 12, marginBottom: 8 }} />
                <div className="skel" style={{ width: '100%', height: 6, borderRadius: 3 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
