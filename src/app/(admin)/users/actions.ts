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

  const existingUser = await db.findUserByEmail(email);
  if (existingUser?.orgId) {
    return { error: 'This person already belongs to an organisation. Multi-org membership is not yet supported.' };
  }

  const existingInvite = await db.findInviteByEmail(email);
  if (existingInvite?.orgId === user.orgId) {
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

export async function removeUser(targetId: string) {
  const currentUser = await getSessionUser();
  if (!currentUser?.orgId || currentUser.id === targetId) return;
  await getDb().deleteUser(targetId);
  revalidatePath('/users');
}

export async function changeUserRole(targetId: string, role: 'Admin' | 'Manager' | 'Employee') {
  const currentUser = await getSessionUser();
  if (!currentUser?.orgId || currentUser.id === targetId) return;
  const db = getDb();
  const target = await db.getUser(targetId);
  if (!target || target.orgId !== currentUser.orgId) return;
  await db.upsertUser(targetId, { ...target, role });
  revalidatePath('/users');
}
