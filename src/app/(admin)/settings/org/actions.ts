'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function saveOrgSettings(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.orgId) return { ok: false, error: 'Not authorised.' };

  const name     = String(formData.get('name') ?? '').trim();
  const currency = String(formData.get('currency') ?? 'GHS').trim();

  if (!name) return { ok: false, error: 'Organisation name is required.' };

  await getDb().updateOrg(user.orgId, { name, currency });
  revalidatePath('/settings/org');
  return { ok: true };
}

/** Remove the current user's profile and sign them out. The org stays intact. */
export async function deleteAccount() {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: 'Not authenticated.' };

  await getDb().deleteUser(user.id);
  (await cookies()).set('payreq_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  redirect('/auth/signin');
}

/** Delete the entire organisation and all its data. Only the owner can do this. */
export async function deleteOrganisation() {
  const user = await getSessionUser();
  if (!user?.orgId) return { ok: false, error: 'Not authenticated.' };

  const org = await getDb().getOrg(user.orgId);
  if (!org) return { ok: false, error: 'Organisation not found.' };
  if (org.ownerUid !== user.id) return { ok: false, error: 'Only the organisation owner can delete it.' };

  await getDb().deleteOrg(user.orgId);
  (await cookies()).set('payreq_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  redirect('/auth/signin');
}
