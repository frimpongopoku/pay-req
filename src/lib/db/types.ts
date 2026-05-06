export type AssetStatus = 'active' | 'inactive';
export type RequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PAID'
  | 'RECEIPTS_SUBMITTED'
  | 'COMPLETED'
  | 'DENIED';
export type Priority = 'high' | 'med' | 'low';

export interface Asset {
  id: string;
  orgId: string;
  name: string;
  tag: string;
  managers: string[];
  slack: string | null;
}

export interface Request {
  id: string;
  orgId: string;
  asset: string;
  title: string;
  amount: number;
  currency: string;
  requester: string;
  requesterUid?: string;
  status: RequestStatus;
  deadline: string;
  submitted: string;
  submittedAt?: string;
  purpose: string;
  payee: string;
  attachments: string[];
  priority: Priority;
  additionalDetails?: string;
}

export interface ActivityItem {
  id: string;
  orgId: string;
  who: string;
  what: string;
  ts: string;
  tag: string;
  avHue?: number;
}

export interface Organisation {
  id: string;
  name: string;
  ownerUid: string;
  createdAt: string;
}

export interface Invite {
  id: string;
  email: string;
  orgId: string;
  role: 'Admin' | 'Manager' | 'Employee';
  invitedBy: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
  orgId?: string;
  depot: string;
  hue: number;
}

export interface KPI {
  label: string;
  value: string;
  delta: string;
  down?: boolean;
  spark: number[];
  color: string;
}

export interface RequestFilters {
  status?: RequestStatus | RequestStatus[];
  asset?: string;
  requester?: string;
}
