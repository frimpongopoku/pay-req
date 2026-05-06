// AssetFlow — icons + small UI primitives
const { useState, useEffect, useMemo, useRef } = React;

// ---------- Icons (lucide-style, single source of truth) ----------
const Ic = ({ d, size = 16, stroke = 1.75, style, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}
       fill="none" stroke="currentColor" strokeWidth={stroke}
       strokeLinecap="round" strokeLinejoin="round"
       className={"ic " + (className || "")} style={style}>
    {d}
  </svg>
);

const I = {
  inbox:    <Ic d={<><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" /></>} />,
  list:     <Ic d={<><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>} />,
  truck:    <Ic d={<><path d="M1 7h13v10H1z" /><path d="M14 10h4l3 3v4h-7z" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>} />,
  users:    <Ic d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />,
  chart:    <Ic d={<><line x1="3" y1="3" x2="3" y2="21" /><line x1="3" y1="21" x2="21" y2="21" /><path d="M7 16l4-5 3 3 5-8" /></>} />,
  slack:    <Ic d={<><rect x="13" y="2" width="3" height="8" rx="1.5" /><rect x="2" y="13" width="8" height="3" rx="1.5" /><rect x="14" y="14" width="3" height="8" rx="1.5" /><rect x="14" y="14" width="8" height="3" rx="1.5" /><rect x="8" y="8" width="3" height="8" rx="1.5" /><rect x="8" y="8" width="8" height="3" rx="1.5" /></>} />,
  settings: <Ic d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>} />,
  search:   <Ic d={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />,
  bell:     <Ic d={<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />,
  plus:     <Ic d={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />,
  filter:   <Ic d={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />} />,
  download: <Ic d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} />,
  check:    <Ic d={<polyline points="20 6 9 17 4 12" />} />,
  x:        <Ic d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />,
  arrowR:   <Ic d={<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>} />,
  arrowUp:  <Ic d={<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>} />,
  arrowDn:  <Ic d={<><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>} />,
  cal:      <Ic d={<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />,
  clip:     <Ic d={<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />} />,
  msg:      <Ic d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />,
  more:     <Ic d={<><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>} />,
  sliders:  <Ic d={<><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></>} />,
  pin:      <Ic d={<><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1V4H8v2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" /></>} />,
  link:     <Ic d={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>} />,
  globe:    <Ic d={<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>} />,
  copy:     <Ic d={<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />,
  flag:     <Ic d={<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>} />,
  doc:      <Ic d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>} />,
};
window.I = I;
window.Ic = Ic;

// ---------- Pill ----------
function Pill({ status }) {
  const m = {
    SUBMITTED:        ["submitted",  "Submitted"],
    UNDER_REVIEW:     ["review",     "Under review"],
    APPROVED:         ["approved",   "Approved"],
    PAID:             ["paid",       "Paid"],
    RECEIPTS_SUBMITTED:["receipts",  "Receipts in"],
    COMPLETED:        ["completed",  "Completed"],
    DENIED:           ["denied",     "Denied"],
  };
  const [cls, label] = m[status] || ["submitted", status];
  return <span className={"pill " + cls}><span className="dot" />{label}</span>;
}
window.Pill = Pill;

// ---------- Avatar ----------
function Avatar({ name, size = 28, hue }) {
  const initials = name.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const h = hue ?? (name.charCodeAt(0) * 37) % 360;
  return (
    <div className="avatar" style={{
      width: size, height: size, fontSize: size * 0.4,
      background: `linear-gradient(135deg, oklch(0.78 0.06 ${h}), oklch(0.55 0.10 ${h}))`,
    }}>{initials}</div>
  );
}
window.Avatar = Avatar;

// ---------- Mini sparkline ----------
function Spark({ data, w = 110, h = 36, color = "var(--accent)", fill = true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 4) - 2
  ]);
  const path = "M " + pts.map(p => p.join(",")).join(" L ");
  const area = path + ` L ${w},${h} L 0,${h} Z`;
  const id = "spark-" + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={w} height={h}>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${id})`} />
        </>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
window.Spark = Spark;

Object.assign(window, { Ic, I, Pill, Avatar, Spark });
