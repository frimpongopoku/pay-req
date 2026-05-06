import type { RequestStatus } from '@/lib/data';

const STATUS_MAP: Record<RequestStatus, [string, string]> = {
  SUBMITTED:          ['submitted',  'Submitted'],
  UNDER_REVIEW:       ['review',     'Under review'],
  APPROVED:           ['approved',   'Approved'],
  PAID:               ['paid',       'Paid'],
  RECEIPTS_SUBMITTED: ['receipts',   'Receipts in'],
  COMPLETED:          ['completed',  'Completed'],
  DENIED:             ['denied',     'Denied'],
};

export function Pill({ status }: { status: RequestStatus }) {
  const [cls, label] = STATUS_MAP[status] ?? ['submitted', status];
  return (
    <span className={`pill ${cls}`}>
      <span className="dot" />{label}
    </span>
  );
}

export function MPill({ status }: { status: RequestStatus }) {
  const [cls, label] = STATUS_MAP[status] ?? ['submitted', status];
  return (
    <span className={`m-pill ${cls}`}>
      <span className="dot" />{label}
    </span>
  );
}
