'use server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function addMobileAttachments(requestId: string, urls: string[]) {
  if (!urls.length) return;
  const user = await getSessionUser();
  if (!user?.orgId) return;
  const db = getDb();
  const req = await db.getRequest(requestId);
  if (!req) return;
  await db.updateRequest(requestId, { attachments: [...req.attachments, ...urls] });
  await db.addActivity(user.orgId, {
    who: user.name,
    what: `uploaded ${urls.length} receipt${urls.length !== 1 ? 's' : ''} for ${requestId}`,
    tag: 'attach',
  });
  revalidatePath(`/m/requests/${requestId}`);
  revalidatePath('/m');
}
