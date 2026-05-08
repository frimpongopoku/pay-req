'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { notify } from '@/lib/slack';
import { invalidateOrgCache } from '@/lib/db/cached';
import type { Priority, PayeeDetails } from '@/lib/db';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function createRequest(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect('/auth/signin');
  if (!user.orgId) redirect('/onboarding');

  const db = getDb();

  const assetId           = formData.get('asset') as string;
  const title             = (formData.get('title') as string).trim();
  const amount            = parseFloat(formData.get('amount') as string);
  const priority          = (formData.get('priority') as Priority) ?? 'med';
  const deadline          = formData.get('deadline') as string;
  const payee             = (formData.get('payee') as string).trim();
  const purpose           = (formData.get('purpose') as string).trim();
  const currency          = (formData.get('currency') as string | null)?.trim() || 'GHS';
  const additionalDetails = (formData.get('additionalDetails') as string | null)?.trim() || undefined;
  const payeeDetailsRaw = formData.get('payeeDetails') as string | null;
  const payeeDetails: PayeeDetails | undefined = payeeDetailsRaw ? JSON.parse(payeeDetailsRaw) : undefined;
  const attachments       = formData.getAll('attachments').filter(Boolean) as string[];

  if (!assetId || !title || isNaN(amount) || !deadline || !payee || !purpose) {
    throw new Error('All required fields must be filled.');
  }

  const now = new Date();
  const submitted = now.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });

  const request = await db.createRequest({
    orgId: user.orgId,
    asset: assetId,
    title,
    amount,
    currency,
    requester: user.name,
    requesterUid: user.id,
    status: 'SUBMITTED',
    deadline: formatDate(deadline),
    submitted,
    submittedAt: now.toISOString(),
    purpose,
    payee,
    payeeDetails,
    attachments,
    priority,
    additionalDetails,
  });

  await db.addActivity(user.orgId, {
    who: user.name,
    what: `submitted ${request.id} — ${title}`,
    tag: 'submit',
  });

  invalidateOrgCache(user.orgId);
  revalidatePath('/requests');
  revalidatePath('/dashboard');

  const asset = await db.getAsset(assetId);
  await notify(user.orgId, 'new_request', {
    requestId: request.id,
    title,
    amount,
    currency,
    requester: user.name,
    deadline: formatDate(deadline),
    priority,
    assetName: asset?.name ?? assetId,
    assetSlack: asset?.slack,
    purpose,
    payeeDetails,
  });

  redirect(`/requests/${request.id}`);
}
