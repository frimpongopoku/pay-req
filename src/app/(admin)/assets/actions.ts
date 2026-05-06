'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function createAsset(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.orgId) return { ok: false, error: 'Not authorised.' };

  const name = String(formData.get('name') ?? '').trim();
  const tag = String(formData.get('tag') ?? '').trim();
  const slackRaw = String(formData.get('slack') ?? '').trim();
  const managers = formData
    .getAll('managers')
    .map(v => String(v).trim())
    .filter(Boolean);

  if (!name) return { ok: false, error: 'Asset name is required.' };
  if (!managers.length) return { ok: false, error: 'Select at least one manager.' };

  await getDb().createAsset({
    orgId: user.orgId,
    name,
    tag,
    managers,
    slack: slackRaw || null,
  });

  revalidatePath('/assets');
  revalidatePath('/requests/new');
  revalidatePath('/m/create');

  return { ok: true };
}
