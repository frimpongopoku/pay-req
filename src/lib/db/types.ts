export type AssetStatus = 'active' | 'inactive';
export type AssetType = 'car' | 'building' | 'device' | 'machine' | 'other';
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
  type: AssetType;
  details: Record<string, string>;
  tags: string[];
  managers: string[];
  slack: string | null;
}

export interface PayeeDetails {
  [key: string]: string | undefined;
  method: 'momo' | 'bank' | 'other';
  momoNetwork?: string;
  momoNumber?: string;
  momoName?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  reference?: string;
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
  payeeDetails?: PayeeDetails;
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

export interface SlackEvents {
  new_request: boolean;
  status_change: boolean;
  receipt_submission: boolean;
}

export interface Organisation {
  id: string;
  name: string;
  ownerUid: string;
  createdAt: string;
  currency: string;
  slackWebhook?: string;
  slackChannel?: string;
  slackEvents?: SlackEvents;
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
