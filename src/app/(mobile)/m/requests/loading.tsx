export default function MobileRequestsLoading() {
  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Title */}
      <div style={{ padding: '18px 22px 4px' }}>
        <div className="skel" style={{ width: 130, height: 22, marginBottom: 10 }} />
        <div className="skel" style={{ width: 160, height: 13 }} />
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 22px', overflowX: 'auto' }}>
        {[80, 60, 130, 95, 70].map((w, i) => (
          <div key={i} className="skel" style={{ width: w, height: 34, borderRadius: 999, flexShrink: 0 }} />
        ))}
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 22px 10px' }}>
        <div className="skel" style={{ width: '100%', height: 44, borderRadius: 14 }} />
      </div>

      {/* Request cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ borderRadius: 18, overflow: 'hidden', padding: 16, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(15,23,42,0.07)' }}>
            <div className="row" style={{ gap: 8, marginBottom: 8 }}>
              <div className="skel" style={{ width: 90, height: 12, borderRadius: 999 }} />
              <div className="skel" style={{ width: 75, height: 22, borderRadius: 999 }} />
            </div>
            <div className="skel" style={{ width: '80%', height: 15, marginBottom: 8 }} />
            <div className="skel" style={{ width: '100%', height: 4, borderRadius: 2, marginBottom: 10 }} />
            <div className="row" style={{ gap: 8 }}>
              <div className="skel" style={{ width: 100, height: 12 }} />
              <div className="skel" style={{ width: 70, height: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
