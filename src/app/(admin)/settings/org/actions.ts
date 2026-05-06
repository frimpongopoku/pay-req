'use server';
import { revalidatePath } from 'next/cache';
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
