'use server';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function createOrganisation(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect('/auth/signin');
  if (user.orgId) redirect('/dashboard');

  const name = (formData.get('name') as string).trim();
  if (!name) throw new Error('Organisation name is required.');

  const db = getDb();

  const org = await db.createOrg({
    name,
    ownerUid: user.id,
    createdAt: new Date().toISOString(),
    currency: 'GHS',
  });

  await db.upsertUser(user.id, {
    name: user.name,
    email: user.email,
    role: 'Admin',
    orgId: org.id,
    depot: user.depot,
    hue: user.hue,
  });

  redirect('/dashboard');
}
