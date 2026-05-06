// AssetFlow Mobile — 5 screens (Home, Home+Push, Create, Detail, MyRequests, Empty)
const { StatusBar, TabBar, HomeIndicator, MPill, StagesMini, MI } = window.MobileShell;

function MHome({ withPush }) {
  return (
    <div className="m-screen">
      <StatusBar />
      {withPush && (
        <div className="m-push">
          <div className="ico">{MI.spark}</div>
          <div className="body">
            <div className="app"><b style={{ fontWeight: 600, color: 'var(--m-ink-1)' }}>AssetFlow</b><span className="dot" /><span>now</span></div>
            <div className="ttl">Request approved ✓</div>
            <div className="msg">Maya approved <b>REQ-2417</b> — DEF system fault. You can pick up the part at Volvo Service NW.</div>
          </div>
          <div className="time">now</div>
        </div>
      )}
      <div className="m-body">
        <div className="m-header">
          <div className="greet">
            <div className="hello">Tuesday, May 5</div>
            <div className="name">Hi, Tomás 👋</div>
          </div>
          <div className="m-icon-btn">{MI.bell}<span className="badge" /></div>
          <div className="av" style={{ background: 'linear-gradient(135deg, oklch(0.78 0.06 140), oklch(0.55 0.10 140))' }}>TR</div>
        </div>

        <div className="m-hero">
          <div className="lab">In review · 1 of yours</div>
          <div className="title">Brake pad + rotor replacement</div>
          <div className="sub">Maya is reviewing the quote from Eastside Diesel. She usually replies within an hour.</div>
          <div className="row">
            <span className="pill-w"><span className="dot" />Under review</span>
            <span style={{ marginLeft: 'auto', opacity: 0.85 }}>$1,840 · due May 9</span>
          </div>
        </div>

        <div className="m-sec"><h3>Quick actions</h3></div>
        <div className="m-quick">
          <div className="a">
            <div className="ic-w">{MI.plus}</div>
            <div className="lbl">New request</div>
            <div className="sub">Repair, parts, service</div>
          </div>
          <div className="a alt">
            <div className="ic-w">{MI.cam}</div>
            <div className="lbl">Upload receipt</div>
            <div className="sub">For REQ-2415</div>
          </div>
        </div>

        <div className="m-sec"><h3>Your requests</h3><span className="more">See all →</span></div>

        <div className="m-req">
          <div className="top">
            <span className="id">REQ-2418</span>
            <MPill status="UNDER_REVIEW" />
            <span className="spacer" />
            <span style={{ fontSize: 11.5, color: 'var(--m-ink-2)' }}>{MI.flag}</span>
          </div>
          <div className="ttl">Brake pad + rotor replacement</div>
          <StagesMini stage={1} />
          <div className="meta"><span>Truck 042</span><span>·</span><span><b>$1,840</b></span><span>·</span><span>Due May 9</span></div>
        </div>

        <div className="m-req">
          <div className="top">
            <span className="id">REQ-2417</span>
            <MPill status="APPROVED" />
            <span className="spacer" />
          </div>
          <div className="ttl">DEF system fault — diagnostic + sensor</div>
          <StagesMini stage={2} />
          <div className="meta"><span>Truck 028</span><span>·</span><span><b>$920</b></span><span>·</span><span>Due May 7</span></div>
        </div>

        <div className="m-req">
          <div className="top">
            <span className="id">REQ-2415</span>
            <MPill status="RECEIPTS_SUBMITTED" />
            <span className="spacer" />
          </div>
          <div className="ttl">Side mirror replacement</div>
          <StagesMini stage={4} />
          <div className="meta"><span>Van 117</span><span>·</span><span><b>$245</b></span><span>·</span><span>2 receipts</span></div>
        </div>

        <div className="m-bottom-pad" />
      </div>
      <TabBar active="home" />
      <HomeIndicator />
    </div>
  );
}

function MCreate() {
  return (
    <div className="m-screen">
      <StatusBar />
      <div className="m-body">
        <div className="m-header" style={{ paddingBottom: 4 }}>
          <div className="m-icon-btn" style={{ background: 'transparent', border: 'none' }}>{MI.back}</div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>New request</div>
          <div style={{ width: 40, fontSize: 12, color: 'var(--m-ink-2)', textAlign: 'right' }}>Step 1/1</div>
        </div>

        <div className="m-form-field">
          <label>Asset</label>
          <div className="picker">
            <div className="ic-w">{MI.truck}</div>
            <div>
              <div className="name">Truck 042 — Freightliner M2</div>
              <div className="sub">East depot · Maya Patel</div>
            </div>
            <div className="chev">{MI.chev}</div>
          </div>
        </div>

        <div className="m-form-field">
          <label>What do you need?</label>
          <div className="input">
            Brake pad + rotor replacement
          </div>
        </div>

        <div className="m-form-field">
          <label>Amount</label>
          <div className="input amount">
            <span>$</span>1,840.00 <span className="cur" style={{ marginLeft: 'auto' }}>USD</span>
          </div>
        </div>

        <div className="m-form-field">
          <label>Priority</label>
          <div className="seg">
            <div className="opt">Low</div>
            <div className="opt">Med</div>
            <div className="opt active">High</div>
          </div>
        </div>

        <div className="m-form-field">
          <label>Need it by</label>
          <div className="picker">
            <div className="ic-w" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--m-warn)' }}>{MI.cal}</div>
            <div>
              <div className="name">Friday, May 9</div>
              <div className="sub">in 4 days · before AM route</div>
            </div>
            <div className="chev">{MI.chev}</div>
          </div>
        </div>

        <div className="m-form-field">
          <label>Payee</label>
          <div className="picker">
            <div className="ic-w" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--m-accent)' }}>{MI.dollar}</div>
            <div>
              <div className="name">Eastside Diesel LLC</div>
              <div className="sub">Vendor · ACH on file</div>
            </div>
            <div className="chev">{MI.chev}</div>
          </div>
        </div>

        <div className="m-form-field">
          <label>Purpose</label>
          <div className="input" style={{ minHeight: 70, fontSize: 14, fontWeight: 400, lineHeight: 1.45, color: 'var(--m-ink-1)' }}>
            Front brake pads worn past 3mm — flagged on pre-trip inspection. Quote attached from Eastside.
          </div>
        </div>

        <div className="m-form-field">
          <label>Attachments</label>
          <div className="files">
            <div className="f"><div className="th">PDF<div className="x">×</div></div><div className="nm">quote.pdf</div></div>
            <div className="f"><div className="th">PDF<div className="x">×</div></div><div className="nm">inspection.pdf</div></div>
            <div className="f"><div className="th">IMG<div className="x">×</div></div><div className="nm">pad.jpg</div></div>
          </div>
          <div className="upload" style={{ marginTop: 10 }}>
            {MI.upload}
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--m-ink-1)' }}>Add photo or PDF</div>
            <div style={{ fontSize: 11.5 }}>From camera, photos or files</div>
          </div>
        </div>

        <div style={{ height: 110 }} />
      </div>

      <div className="m-cta">
        <button className="btn">Submit request {MI.arrowR}</button>
      </div>
      <HomeIndicator />
    </div>
  );
}

function MDetail() {
  return (
    <div className="m-screen">
      <StatusBar />
      <div className="m-body">
        <div className="m-header" style={{ paddingBottom: 4 }}>
          <div className="m-icon-btn" style={{ background: 'transparent', border: 'none' }}>{MI.back}</div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 500, color: 'var(--m-ink-2)' }}>Request</div>
          <div className="m-icon-btn" style={{ background: 'transparent', border: 'none' }}>{MI.more}</div>
        </div>

        <div className="m-detail-head">
          <div className="id">REQ-2418 · submitted May 5, 9:14 AM</div>
          <div className="ttl">Brake pad + rotor replacement</div>
          <div className="row">
            <MPill status="UNDER_REVIEW" />
            <span className="chip">Truck 042</span>
            <span className="chip" style={{ color: 'var(--m-bad)', background: 'rgba(220,38,38,0.08)' }}>High priority</span>
          </div>
        </div>

        <div className="m-card">
          <div className="kv">
            <div className="k">Amount</div><div className="v">$1,840 <span style={{ color: 'var(--m-ink-3)', fontWeight: 400 }}>USD</span></div>
            <div className="k">Payee</div><div className="v">Eastside Diesel</div>
            <div className="k">Need by</div><div className="v">Fri, May 9</div>
            <div className="k">Reviewer</div><div className="v">Maya Patel</div>
          </div>
        </div>

        <div className="m-sec" style={{ paddingTop: 0 }}><h3>Lifecycle</h3></div>
        <div className="m-vsteps">
          <div className="m-vstep done">
            <div className="col-mark"><div className="mark" /><div className="line" /></div>
            <div className="body">
              <div className="name">Submitted</div>
              <div className="ts">Today, 9:14 AM</div>
              <div className="note">You submitted with 3 attachments. Auto-assigned to Maya Patel as manager of Truck 042.</div>
            </div>
          </div>
          <div className="m-vstep cur">
            <div className="col-mark"><div className="mark" /><div className="line" /></div>
            <div className="body">
              <div className="name">Under review</div>
              <div className="ts">Today, 9:42 AM · 28 min in stage</div>
              <div className="note" style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.2)' }}>
                <b>Maya Patel</b> — Pulling rotor measurements. Asked Eastside for a line-item breakdown; will update shortly.
              </div>
            </div>
          </div>
          <div className="m-vstep">
            <div className="col-mark"><div className="mark" /><div className="line" /></div>
            <div className="body"><div className="name" style={{ color: 'var(--m-ink-3)' }}>Approved</div></div>
          </div>
          <div className="m-vstep">
            <div className="col-mark"><div className="mark" /><div className="line" /></div>
            <div className="body"><div className="name" style={{ color: 'var(--m-ink-3)' }}>Paid</div></div>
          </div>
          <div className="m-vstep">
            <div className="col-mark"><div className="mark" /><div className="line" /></div>
            <div className="body"><div className="name" style={{ color: 'var(--m-ink-3)' }}>Receipts in</div></div>
          </div>
          <div className="m-vstep">
            <div className="col-mark"><div className="mark" /></div>
            <div className="body"><div className="name" style={{ color: 'var(--m-ink-3)' }}>Completed</div></div>
          </div>
        </div>

        <div className="m-card">
          <h4>Attachments</h4>
          <div className="files" style={{ display: 'flex', gap: 8 }}>
            {['quote.pdf','inspection.pdf','pad.jpg'].map((f,i) => (
              <div key={i} style={{ width: 60 }}>
                <div style={{ width: 60, height: 60, borderRadius: 12, background: 'repeating-linear-gradient(45deg, rgba(28,25,23,0.06) 0 1px, transparent 1px 8px), linear-gradient(135deg,#f5e9dc,#e7d5c0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-monospace,monospace', fontSize: 9.5, color: 'var(--m-ink-2)', border: '1px solid var(--m-line)' }}>{f.endsWith('.pdf') ? 'PDF' : 'IMG'}</div>
                <div style={{ fontSize: 10, color: 'var(--m-ink-2)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{f}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 110 }} />
      </div>
      <HomeIndicator />
    </div>
  );
}

function MList() {
  const items = [
    { id: 'REQ-2418', t: 'Brake pad + rotor replacement', a: 'Truck 042', amt: 1840, st: 'UNDER_REVIEW', stage: 1 },
    { id: 'REQ-2417', t: 'DEF system fault', a: 'Truck 028', amt: 920, st: 'APPROVED', stage: 2 },
    { id: 'REQ-2415', t: 'Side mirror replacement', a: 'Van 117', amt: 245, st: 'RECEIPTS_SUBMITTED', stage: 4 },
    { id: 'REQ-2413', t: 'Tire rotation + alignment', a: 'Truck 042', amt: 280, st: 'SUBMITTED', stage: 0 },
    { id: 'REQ-2402', t: 'Quarterly DOT inspection', a: 'Truck 051', amt: 380, st: 'COMPLETED', stage: 5 },
    { id: 'REQ-2398', t: 'Windshield chip repair', a: 'Van 089', amt: 95, st: 'DENIED', stage: -1 },
    { id: 'REQ-2386', t: 'Coolant flush', a: 'Truck 042', amt: 165, st: 'COMPLETED', stage: 5 },
  ];
  return (
    <div className="m-screen">
      <StatusBar />
      <div className="m-body">
        <div className="m-page-title">My requests</div>
        <div style={{ padding: '6px 22px 14px', fontSize: 12.5, color: 'var(--m-ink-2)' }}>14 total · 3 still open</div>

        <div className="m-filters">
          <div className="ch active">All <span className="n">14</span></div>
          <div className="ch">Open <span className="n">3</span></div>
          <div className="ch">Awaiting receipt <span className="n">1</span></div>
          <div className="ch">Completed <span className="n">9</span></div>
          <div className="ch">Denied <span className="n">1</span></div>
        </div>

        <div style={{ padding: '0 22px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'var(--m-glass-2)', border: '1px solid var(--m-line)', color: 'var(--m-ink-3)', fontSize: 13 }}>
            {MI.search}<span>Search by ID, asset or vendor</span>
          </div>
        </div>

        {items.map(r => (
          <div key={r.id} className="m-req">
            <div className="top">
              <span className="id">{r.id}</span>
              <MPill status={r.st} />
              <span className="spacer" />
            </div>
            <div className="ttl">{r.t}</div>
            {r.stage >= 0 && <StagesMini stage={r.stage} />}
            <div className="meta"><span>{r.a}</span><span>·</span><span><b>${r.amt.toLocaleString()}</b></span></div>
          </div>
        ))}
        <div className="m-bottom-pad" />
      </div>
      <TabBar active="list" />
      <HomeIndicator />
    </div>
  );
}

function MEmpty() {
  return (
    <div className="m-screen">
      <StatusBar />
      <div className="m-body">
        <div className="m-header">
          <div className="greet">
            <div className="hello">Welcome to Northbound Freight</div>
            <div className="name">Hi, Jordan 👋</div>
          </div>
          <div className="av" style={{ background: 'linear-gradient(135deg, oklch(0.78 0.06 280), oklch(0.55 0.10 280))' }}>JK</div>
        </div>

        <div className="m-empty">
          <div className="ill">{MI.spark}</div>
          <h3>You haven't made a request yet</h3>
          <p>When something on Truck 042 needs a repair, part or service, file a request here. Maya will see it in seconds.</p>
          <div className="btn-go">{MI.plus}<span>Create your first request</span></div>
        </div>

        <div className="m-sec" style={{ paddingTop: 16 }}><h3>How it works</h3></div>
        {[
          { n: 1, t: 'Pick the asset and amount', s: 'Truck, van, trailer — whatever needs fixing.' },
          { n: 2, t: 'Snap photos and add a quote', s: 'PDFs and images, as many as you need.' },
          { n: 3, t: 'Track it through to paid', s: 'You\u2019ll get a push when status changes.' },
        ].map(s => (
          <div key={s.n} style={{ margin: '0 22px 10px', padding: '14px 16px', borderRadius: 16, background: 'var(--m-glass)', border: '1px solid var(--m-glass-border)', backdropFilter: 'blur(16px)', display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--m-accent-soft)', color: 'var(--m-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{s.n}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: 'var(--m-ink-2)', marginTop: 2 }}>{s.s}</div>
            </div>
          </div>
        ))}

        <div className="m-bottom-pad" />
      </div>
      <TabBar active="home" />
      <HomeIndicator />
    </div>
  );
}

window.MobileScreens = { MHome, MCreate, MDetail, MList, MEmpty };
