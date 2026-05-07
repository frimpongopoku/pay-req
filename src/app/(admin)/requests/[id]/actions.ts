'use server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { notify } from '@/lib/slack';
import type { RequestStatus } from '@/lib/db';

const NEXT: Partial<Record<RequestStatus, RequestStatus>> = {
  SUBMITTED:          'APPROVED',
  UNDER_REVIEW:       'APPROVED',   // legacy
  APPROVED:           'PAID',
  PAID:               'RECEIPTS_SUBMITTED',
  RECEIPTS_SUBMITTED: 'COMPLETED',
  COMPLETED:          'SUBMITTED',
  DENIED:             'SUBMITTED',
};

const PREV: Partial<Record<RequestStatus, RequestStatus>> = {
  UNDER_REVIEW:       'SUBMITTED',   // legacy
  APPROVED:           'SUBMITTED',
  PAID:               'APPROVED',
  RECEIPTS_SUBMITTED: 'PAID',
  COMPLETED:          'RECEIPTS_SUBMITTED',
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED:          'Submitted',
  UNDER_REVIEW:       'Under review',
  APPROVED:           'Approved',
  PAID:               'Paid',
  RECEIPTS_SUBMITTED: 'Receipts submitted',
  COMPLETED:          'Completed',
  DENIED:             'Denied',
};

function invalidate(id: string) {
  revalidatePath(`/requests/${id}`);
  revalidatePath('/requests');
  revalidatePath('/dashboard');
}

async function fireStatusNotify(
  orgId: string,
  requestId: string,
  prevStatus: RequestStatus,
  toStatus: RequestStatus,
) {
  const db = getDb();
  const req = await db.getRequest(requestId);
  if (!req) return;
  const asset = await db.getAsset(req.asset);
  const event = toStatus === 'RECEIPTS_SUBMITTED' ? 'receipt_submission' : 'status_change';
  await notify(orgId, event, {
    requestId,
    title: req.title,
    amount: req.amount,
    currency: req.currency,
    requester: req.requester,
    deadline: req.deadline,
    priority: req.priority,
    assetName: asset?.name ?? req.asset,
    assetSlack: asset?.slack,
    toStatus,
    prevStatus,
  });
}

export async function advanceStatus(id: string, currentStatus: RequestStatus) {
  const next = NEXT[currentStatus];
  if (!next) return;
  const [db, user] = [getDb(), await getSessionUser()];
  if (!user?.orgId) return;
  await db.updateRequest(id, { status: next });
  await db.addActivity(user.orgId, { who: user.name, what: `moved ${id} to ${STATUS_LABELS[next]}`, tag: 'advance' });
  invalidate(id);
  await fireStatusNotify(user.orgId, id, currentStatus, next);
}

export async function rewindStatus(id: string, currentStatus: RequestStatus) {
  const prev = PREV[currentStatus];
  if (!prev) return;
  const [db, user] = [getDb(), await getSessionUser()];
  if (!user?.orgId) return;
  await db.updateRequest(id, { status: prev });
  await db.addActivity(user.orgId, { who: user.name, what: `rewound ${id} to ${STATUS_LABELS[prev]}`, tag: 'rewind' });
  invalidate(id);
  await fireStatusNotify(user.orgId, id, currentStatus, prev);
}

export async function denyRequest(id: string) {
  const [db, user] = [getDb(), await getSessionUser()];
  if (!user?.orgId) return;
  const req = await db.getRequest(id);
  const prevStatus = req?.status ?? 'SUBMITTED' as RequestStatus;
  await db.updateRequest(id, { status: 'DENIED' });
  await db.addActivity(user.orgId, { who: user.name, what: `denied ${id}`, tag: 'deny' });
  invalidate(id);
  if (req) {
    const asset = await db.getAsset(req.asset);
    await notify(user.orgId, 'status_change', {
      requestId: id,
      title: req.title,
      amount: req.amount,
      currency: req.currency,
      requester: req.requester,
      deadline: req.deadline,
      priority: req.priority,
      assetName: asset?.name ?? req.asset,
      assetSlack: asset?.slack,
      toStatus: 'DENIED',
      prevStatus,
    });
  }
}

export async function addAttachments(id: string, urls: string[]) {
  if (!urls.length) return;
  const [db, user] = [getDb(), await getSessionUser()];
  if (!user?.orgId) return;
  const req = await db.getRequest(id);
  if (!req) return;
  await db.updateRequest(id, { attachments: [...req.attachments, ...urls] });
  await db.addActivity(user.orgId, { who: user.name, what: `added ${urls.length} attachment${urls.length !== 1 ? 's' : ''} to ${id}`, tag: 'attach' });
  invalidate(id);
}
