'use server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import type { Invite } from '@/lib/db';

export async function inviteUser(
  email: string,
  role: Invite['role'],
): Promise<{ ok?: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user?.orgId) return { error: 'Not authorised.' };

  email = email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Enter a valid email address.' };
  }

  const db = getDb();

  const existing = await db.findInviteByEmail(email);
  if (existing?.orgId === user.orgId) {
    return { error: 'This email already has a pending invite.' };
  }

  await db.createInvite({
    email,
    orgId: user.orgId,
    role,
    invitedBy: user.name,
    createdAt: new Date().toISOString(),
  });

  revalidatePath('/users');
  return { ok: true };
}

export async function revokeInvite(id: string) {
  const user = await getSessionUser();
  if (!user?.orgId) return;
  await getDb().deleteInvite(id);
  revalidatePath('/users');
}
