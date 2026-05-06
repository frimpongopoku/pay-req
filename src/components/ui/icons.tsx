import React from 'react';

const Ic = ({ d, size = 16, stroke = 1.75, style, className }: {
  d: React.ReactNode; size?: number; stroke?: number; style?: React.CSSProperties; className?: string;
}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}
    fill="none" stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round"
    className={'ic ' + (className || '')} style={style}>
    {d}
  </svg>
);

export const I = {
  inbox:    <Ic d={<><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" /></>} />,
  truck:    <Ic d={<><path d="M1 7h13v10H1z" /><path d="M14 10h4l3 3v4h-7z" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>} />,
  users:    <Ic d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />,
  chart:    <Ic d={<><line x1="3" y1="3" x2="3" y2="21" /><line x1="3" y1="21" x2="21" y2="21" /><path d="M7 16l4-5 3 3 5-8" /></>} />,
  slack:    <Ic d={<><rect x="13" y="2" width="3" height="8" rx="1.5" /><rect x="2" y="13" width="8" height="3" rx="1.5" /><rect x="14" y="14" width="3" height="8" rx="1.5" /><rect x="14" y="14" width="8" height="3" rx="1.5" /><rect x="8" y="8" width="3" height="8" rx="1.5" /><rect x="8" y="8" width="8" height="3" rx="1.5" /></>} />,
  settings: <Ic d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>} />,
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
  more:     <Ic d={<><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>} />,
  link:     <Ic d={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>} />,
  copy:     <Ic d={<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />,
  flag:     <Ic d={<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>} />,
  doc:      <Ic d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>} />,
};

// Mobile icons (20px, stroke 2)
const MIc = ({ d, size = 20, stroke = 2 }: { d: React.ReactNode; size?: number; stroke?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

export const MI = {
  bell:    <MIc d={<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>} />,
  plus:    <MIc d={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />,
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
  upload:  <MIc d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>} />,
  msg:     <MIc d={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />} />,
  check:   <MIc d={<polyline points="20 6 9 17 4 12" />} />,
  spark:   <MIc d={<path d="M12 2l2.4 7.4H22l-6.2 4.6L18.2 22 12 17.4 5.8 22l2.4-8L2 9.4h7.6z" />} />,
  history: <MIc d={<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><polyline points="3 3 3 8 8 8" /><polyline points="12 7 12 12 15.5 14" /></>} />,
};
