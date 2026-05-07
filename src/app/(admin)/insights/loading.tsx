export default function InsightsLoading() {
  return (
    <div className="page">
      <div style={{ marginBottom: 18 }}>
        <div className="skel" style={{ width: 120, height: 28, marginBottom: 10 }} />
        <div className="skel" style={{ width: 240, height: 14 }} />
      </div>

      <div className="grid g-4" style={{ marginBottom: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card glass">
            <div className="skel" style={{ width: '55%', height: 12, marginBottom: 10 }} />
            <div className="skel" style={{ width: '75%', height: 28, marginBottom: 10 }} />
            <div className="skel" style={{ width: '45%', height: 10 }} />
          </div>
        ))}
      </div>

      <div className="grid g-2" style={{ marginBottom: 16 }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card glass" style={{ minHeight: 180 }}>
            <div className="skel" style={{ width: '100%', height: '100%', borderRadius: 10 }} />
          </div>
        ))}
      </div>

      <div className="card glass" style={{ minHeight: 340 }}>
        <div className="card-h" style={{ marginBottom: 20 }}>
          <div className="skel" style={{ width: 200, height: 16 }} />
        </div>
        <div className="skel" style={{ width: '100%', height: 260, borderRadius: 10 }} />
      </div>
    </div>
  );
}
