// AssetFlow Mobile (employee) — screen components
const { useState: useStateM } = React;

// ---- Inline icons (mobile-tuned)
const MIc = ({ d, size = 20, stroke = 2 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const MI = {
  bell:    <MIc d={<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />,
  plus:    <MIc d={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />,
  receipt: <MIc d={<><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2" /><line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></>} />,
  cam:     <MIc d={<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>} />,
  truck:   <MIc d={<><path d="M1 7h13v10H1z" /><path d="M14 10h4l3 3v4h-7z" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>} />,
  arrowR:  <MIc d={<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>} />,
  chev:    <MIc d={<polyline points="9 6 15 12 9 18" />} />,
  back:    <MIc d={<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>} />,
  more:    <MIc d={<><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /><circle cx="5" cy="12" r="1.5" /></>} />,
  home:    <MIc d={<><path d="M3 9.5L12 3l9 6.5V21H3z" /><polyline points="9 21 9 13 15 13 15 21" /></>} />,
  inbox:   <MIc d={<><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" /></>} />,
  profile: <MIc d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />,
  search:  <MIc d={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />,
  flag:    <MIc d={<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>} />,
  cal:     <MIc d={<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />,
  dollar:  <MIc d={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>} />,
  paper:   <MIc d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>} />,
  upload:  <MIc d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>} />,
  msg:     <MIc d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />,
  check:   <MIc d={<polyline points="20 6 9 17 4 12" />} />,
  spark:   <MIc d={<path d="M12 2l2.4 7.4H22l-6.2 4.6L18.2 22 12 17.4 5.8 22l2.4-8L2 9.4h7.6z" />} />,
  history: <MIc d={<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><polyline points="3 3 3 8 8 8" /><polyline points="12 7 12 12 15.5 14" /></>} />,
};

function StatusBar() {
  return (
    <div className="m-status">
      <span>9:41</span>
      <div className="right">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="0.5"/><rect x="5" y="4" width="3" height="7" rx="0.5"/><rect x="10" y="2" width="3" height="9" rx="0.5"/><rect x="15" y="0" width="3" height="11" rx="0.5"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" strokeWidth="1"><path d="M1 5.5C3 3 5.5 2 8 2s5 1 7 3.5" strokeLinecap="round"/><path d="M3 7.5C4.5 6 6 5.5 8 5.5s3.5.5 5 2" strokeLinecap="round"/><circle cx="8" cy="9.5" r="1" fill="currentColor"/></svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="22" height="11" rx="3"/><rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor"/><rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

function MPill({ status }) {
  const m = {
    SUBMITTED: ["submitted","Submitted"],
    UNDER_REVIEW: ["review","Under review"],
    APPROVED: ["approved","Approved"],
    PAID: ["paid","Paid"],
    RECEIPTS_SUBMITTED: ["receipts","Receipts in"],
    COMPLETED: ["completed","Completed"],
    DENIED: ["denied","Denied"],
  };
  const [c, l] = m[status] || ["submitted", status];
  return <span className={"m-pill " + c}><span className="dot" />{l}</span>;
}

function StagesMini({ stage, total = 6 }) {
  return (
    <div className="stages-mini">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={"s " + (i < stage ? "done" : i === stage ? "cur" : "")} />
      ))}
    </div>
  );
}

function TabBar({ active }) {
  return (
    <div className="m-tabs">
      <div className={"tab " + (active === 'home' ? 'active' : '')}>{MI.home}<span>Home</span></div>
      <div className={"tab " + (active === 'list' ? 'active' : '')}>{MI.inbox}<span>Requests</span></div>
      <div className="fab">{MI.plus}</div>
      <div className={"tab " + (active === 'msgs' ? 'active' : '')}>{MI.msg}<span>Updates</span></div>
      <div className={"tab " + (active === 'me' ? 'active' : '')}>{MI.profile}<span>Me</span></div>
    </div>
  );
}
function HomeIndicator() { return <div className="m-home-indicator" />; }

window.MobileShell = { StatusBar, TabBar, HomeIndicator, MPill, StagesMini, MI };
