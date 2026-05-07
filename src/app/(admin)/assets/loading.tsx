export default function AssetsLoading() {
  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <div className="skel" style={{ width: 100, height: 28, marginBottom: 10 }} />
          <div className="skel" style={{ width: 260, height: 14 }} />
        </div>
      </div>

      <div className="grid g-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card glass" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="row" style={{ gap: 12, marginBottom: 16 }}>
              <div className="skel" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="skel" style={{ width: '70%', height: 14, marginBottom: 8 }} />
                <div className="row" style={{ gap: 6 }}>
                  <div className="skel" style={{ width: 50, height: 20, borderRadius: 999 }} />
                  <div className="skel" style={{ width: 60, height: 20, borderRadius: 999 }} />
                </div>
              </div>
              <div className="skel" style={{ width: 24, height: 24, borderRadius: 6 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[...Array(4)].map((_, j) => (
                <div key={j} className="skel" style={{ height: 12 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
