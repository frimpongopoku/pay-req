'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { invalidateOrgCache } from '@/lib/db/cached';
import type { AssetType } from '@/lib/db/types';

export async function deleteAsset(id: string) {
  const user = await getSessionUser();
  if (!user?.orgId) return { ok: false, error: 'Not authorised.' };
  await getDb().deleteAsset(id);
  invalidateOrgCache(user.orgId);
  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function updateAsset(id: string, formData: FormData) {
  const user = await getSessionUser();
  if (!user?.orgId) return { ok: false, error: 'Not authorised.' };

  const name = String(formData.get('name') ?? '').trim();
  const tag = String(formData.get('tag') ?? '').trim();
  const slackRaw = String(formData.get('slack') ?? '').trim();
  const type = (String(formData.get('type') ?? 'other').trim() || 'other') as AssetType;
  const managers = formData.getAll('managers').map(v => String(v).trim()).filter(Boolean);

  let details: Record<string, string> = {};
  try { details = JSON.parse(String(formData.get('details') ?? '{}')); } catch { details = {}; }

  let tags: string[] = [];
  try { tags = JSON.parse(String(formData.get('tags') ?? '[]')); } catch { tags = []; }

  const excluded = formData.get('excluded') === 'true';

  if (!name) return { ok: false, error: 'Asset name is required.' };

  await getDb().updateAsset(id, {
    name, tag, type, details, tags, managers,
    slack: slackRaw || null,
    excluded,
  });

  invalidateOrgCache(user.orgId);
  revalidatePath('/assets');
  revalidatePath('/dashboard');
  revalidatePath('/requests/new');
  revalidatePath('/m/create');
  return { ok: true };
}

export async function createAsset(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.orgId) return { ok: false, error: 'Not authorised.' };

  const name = String(formData.get('name') ?? '').trim();
  const tag = String(formData.get('tag') ?? '').trim();
  const slackRaw = String(formData.get('slack') ?? '').trim();
  const type = (String(formData.get('type') ?? 'other').trim() || 'other') as AssetType;
  const managers = formData
    .getAll('managers')
    .map(v => String(v).trim())
    .filter(Boolean);

  let details: Record<string, string> = {};
  try { details = JSON.parse(String(formData.get('details') ?? '{}')); } catch { details = {}; }

  let tags: string[] = [];
  try { tags = JSON.parse(String(formData.get('tags') ?? '[]')); } catch { tags = []; }

  if (!name) return { ok: false, error: 'Asset name is required.' };

  await getDb().createAsset({
    orgId: user.orgId,
    name,
    tag,
    type,
    details,
    tags,
    managers,
    slack: slackRaw || null,
  });

  invalidateOrgCache(user.orgId);
  revalidatePath('/assets');
  revalidatePath('/requests/new');
  revalidatePath('/m/create');

  return { ok: true };
}
