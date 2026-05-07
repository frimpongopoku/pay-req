// Types live in db/types.ts. Imported here for use in this file, re-exported for backward compat.
import type { AssetStatus, RequestStatus, Priority, Asset, Request, KPI } from './db/types';
export type { AssetStatus, RequestStatus, Priority, Asset, Request, KPI };

// ActivityItem in data.ts omits the 'id' field (legacy mock shape).
export interface ActivityItem {
  who: string;
  what: string;
  ts: string;
  tag: string;
  avHue?: number;
}

export const ASSETS: Omit<Asset, 'orgId'>[] = [
  { id: 'a1', name: 'Truck 042 — Freightliner M2', tag: 'East depot', type: 'car', details: {}, tags: [], managers: ['Maya Patel'], slack: '#fleet-east' },
  { id: 'a2', name: 'Van 117 — Mercedes Sprinter', tag: 'Last-mile', type: 'car', details: {}, tags: [], managers: ['Maya Patel'], slack: '#fleet-east' },
  { id: 'a3', name: 'Truck 028 — Volvo VNL', tag: 'Long-haul', type: 'car', details: {}, tags: [], managers: ['Diego Romero'], slack: '#fleet-haul' },
  { id: 'a4', name: 'Van 089 — Ford Transit', tag: 'Last-mile', type: 'car', details: {}, tags: [], managers: ['Maya Patel'], slack: null },
  { id: 'a5', name: 'Truck 051 — Kenworth T680', tag: 'Long-haul', type: 'car', details: {}, tags: [], managers: ['Diego Romero', 'Sam Whitt'], slack: '#fleet-haul' },
  { id: 'a6', name: 'Trailer 14 — Reefer 53ft', tag: 'Cold-chain', type: 'machine', details: {}, tags: [], managers: ['Sam Whitt'], slack: '#fleet-cold' },
  { id: 'a7', name: 'Yard tractor — TICO Pro-Spotter', tag: 'Yard', type: 'machine', details: {}, tags: [], managers: ['Maya Patel'], slack: null },
  { id: 'a8', name: 'Box truck 003 — Isuzu NPR', tag: 'Local', type: 'car', details: {}, tags: [], managers: ['Maya Patel'], slack: '#fleet-east' },
];

export const REQUESTS: Omit<Request, 'orgId'>[] = [
  {
    id: 'REQ-2418', asset: 'a1', title: 'Brake pad + rotor replacement', amount: 1840, currency: 'USD',
    requester: 'Tomás Reyes', status: 'SUBMITTED', deadline: 'May 9', submitted: 'May 5, 09:14',
    purpose: 'Front brake pads worn past 3mm — flagged on pre-trip inspection.',
    payee: 'Eastside Diesel LLC',
    attachments: ['inspection.pdf', 'quote-eastside.pdf', 'pad-photo.jpg'],
    additionalDetails: 'Eastside Diesel quote attached. Vehicle will be off route for ~6 hours; backup unit 089 routed to cover the AM run.',
    priority: 'high',
  },
  {
    id: 'REQ-2417', asset: 'a3', title: 'DEF system fault — diagnostic + sensor', amount: 920, currency: 'USD',
    requester: 'Aisha Khan', status: 'APPROVED', deadline: 'May 7', submitted: 'May 4, 16:02',
    purpose: 'Check engine light, code SPN 3361.', payee: 'Volvo Service NW',
    attachments: ['fault-code.pdf'], priority: 'med',
  },
  {
    id: 'REQ-2416', asset: 'a6', title: 'Reefer compressor recharge', amount: 415, currency: 'USD',
    requester: 'Bea Lindgren', status: 'PAID', deadline: 'May 6', submitted: 'May 4, 11:30',
    purpose: 'Trailer not holding 38°F on long routes.', payee: 'Cold Chain Pros',
    attachments: ['quote.pdf'], priority: 'med',
  },
  {
    id: 'REQ-2415', asset: 'a2', title: 'Side mirror replacement', amount: 245, currency: 'USD',
    requester: 'Tomás Reyes', status: 'RECEIPTS_SUBMITTED', deadline: 'May 4', submitted: 'May 3, 08:55',
    purpose: 'Driver-side mirror clipped at delivery.', payee: 'Sprinter Parts Direct',
    attachments: ['receipt-1.jpg', 'invoice.pdf'], priority: 'low',
  },
  {
    id: 'REQ-2414', asset: 'a5', title: 'Quarterly DOT inspection', amount: 380, currency: 'USD',
    requester: 'Park Min-jun', status: 'COMPLETED', deadline: 'May 1', submitted: 'Apr 28, 10:11',
    purpose: 'Scheduled DOT inspection.', payee: 'Truckline Inspections',
    attachments: ['cert.pdf', 'receipt.pdf'], priority: 'low',
  },
  {
    id: 'REQ-2413', asset: 'a1', title: 'Tire rotation + alignment', amount: 280, currency: 'USD',
    requester: 'Tomás Reyes', status: 'SUBMITTED', deadline: 'May 12', submitted: 'May 5, 07:22',
    purpose: 'Uneven wear on rear tires.', payee: 'Eastside Diesel LLC',
    attachments: [], priority: 'low',
  },
  {
    id: 'REQ-2412', asset: 'a4', title: 'Windshield chip repair', amount: 95, currency: 'USD',
    requester: 'Aisha Khan', status: 'DENIED', deadline: 'May 3', submitted: 'May 2, 14:48',
    purpose: 'Small chip on driver side.', payee: 'Glass Doctor',
    attachments: [], priority: 'low',
  },
  {
    id: 'REQ-2411', asset: 'a7', title: 'Hydraulic hose replacement', amount: 1120, currency: 'USD',
    requester: 'Diego Romero', status: 'APPROVED', deadline: 'May 8', submitted: 'May 4, 09:20',
    purpose: 'Visible leak on lift hydraulics.', payee: 'TICO Service',
    attachments: ['photo.jpg', 'quote.pdf'], priority: 'high',
  },
];

export const ACTIVITY: ActivityItem[] = [
  { who: 'Maya Patel',   what: 'moved REQ-2418 to Under review', ts: '4 min ago', tag: 'review' },
  { who: 'Tomás Reyes',  what: 'submitted REQ-2418 with 3 attachments', ts: '1 h ago', tag: 'submit' },
  { who: 'Slack',        what: 'posted to #fleet-east — new request', ts: '1 h ago', tag: 'slack', avHue: 280 },
  { who: 'Diego Romero', what: 'approved REQ-2417', ts: '2 h ago', tag: 'approve' },
  { who: 'Aisha Khan',   what: 'uploaded receipts on REQ-2415', ts: '4 h ago', tag: 'receipt' },
  { who: 'Park Min-jun', what: 'marked REQ-2414 as Completed', ts: 'Yesterday', tag: 'complete' },
];

export const KPIS: KPI[] = [
  { label: 'Open requests',   value: '14',     delta: '+3 this wk', spark: [4,6,5,7,9,8,11,10,12,11,14], color: 'var(--brand)' },
  { label: 'Awaiting review', value: '5',      delta: 'SLA 1.4 d',  spark: [2,3,2,3,4,4,5,4,5,5],       color: 'var(--warn)' },
  { label: 'Spend (MTD)',     value: '$28,410', delta: '+12% vs Apr', spark: [3,4,5,7,6,8,9,11,12,14,16,18,22,24,28], color: 'var(--info)' },
  { label: 'Avg cycle time',  value: '2.6 d',  delta: '−0.4 d', down: false, spark: [3.4,3.2,3.0,2.9,2.8,2.7,2.6], color: 'var(--good)' },
];

export const USERS = [
  { name: 'Maya Patel',   role: 'Admin',   depot: 'East depot', n: 42, hue: 220 },
  { name: 'Diego Romero', role: 'Manager', depot: 'Long-haul',  n: 28, hue: 30 },
  { name: 'Sam Whitt',    role: 'Manager', depot: 'Cold-chain', n: 19, hue: 180 },
  { name: 'Tomás Reyes',  role: 'Employee',  depot: 'East depot', n: 12, hue: 140 },
  { name: 'Aisha Khan',   role: 'Employee',  depot: 'Last-mile',  n: 9,  hue: 320 },
  { name: 'Bea Lindgren', role: 'Employee',  depot: 'Cold-chain', n: 7,  hue: 60 },
  { name: 'Park Min-jun', role: 'Employee',  depot: 'Long-haul',  n: 5,  hue: 260 },
];

export const LIFECYCLE_STAGES = ['SUBMITTED', 'APPROVED', 'PAID', 'RECEIPTS_SUBMITTED', 'COMPLETED'] as const;
export const STAGE_NAMES = ['Submitted', 'Approved', 'Paid', 'Receipts in', 'Completed'];
export const STAGE_TIMES = ['May 5, 09:14', 'May 5, 14:08', 'May 6, 10:30', 'May 8, 16:22', 'May 9, 09:10'];

export function getAsset(id: string) {
  return ASSETS.find(a => a.id === id);
}

export function getRequest(id: string) {
  return REQUESTS.find(r => r.id === id);
}

export function statusToStageIndex(status: RequestStatus): number {
  return LIFECYCLE_STAGES.indexOf(status as typeof LIFECYCLE_STAGES[number]);
}
