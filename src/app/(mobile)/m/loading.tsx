export default function MobileHomeLoading() {
  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Hero card skeleton */}
      <div style={{ margin: '16px 16px 0', borderRadius: 24, overflow: 'hidden', height: 200 }}>
        <div className="skel" style={{ width: '100%', height: '100%', borderRadius: 24 }} />
      </div>

      {/* Quick actions skeleton */}
      <div style={{ padding: '18px 16px 0' }}>
        <div className="skel" style={{ width: 120, height: 13, marginBottom: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skel" style={{ height: 80, borderRadius: 18 }} />
          ))}
        </div>
      </div>

      {/* Recent requests skeleton */}
      <div style={{ padding: '20px 16px 0' }}>
        <div className="skel" style={{ width: 140, height: 13, marginBottom: 14 }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ marginBottom: 10, borderRadius: 18, overflow: 'hidden', padding: 16, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(15,23,42,0.07)' }}>
            <div className="row" style={{ gap: 8, marginBottom: 8 }}>
              <div className="skel" style={{ width: 80, height: 11, borderRadius: 999 }} />
              <div className="skel" style={{ width: 70, height: 20, borderRadius: 999 }} />
            </div>
            <div className="skel" style={{ width: '75%', height: 14, marginBottom: 8 }} />
            <div className="skel" style={{ width: '100%', height: 4, borderRadius: 2, marginBottom: 8 }} />
            <div className="row" style={{ gap: 8 }}>
              <div className="skel" style={{ width: 90, height: 11 }} />
              <div className="skel" style={{ width: 70, height: 11 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
