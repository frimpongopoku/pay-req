'use server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function deleteRequest(id: string) {
  const user = await getSessionUser();
  if (!user?.orgId) return;
  await getDb().deleteRequest(id);
  revalidatePath('/requests');
  revalidatePath('/dashboard');
}

export async function amendRequest(id: string, formData: FormData) {
  const user = await getSessionUser();
  if (!user?.orgId) return { ok: false, error: 'Not authorised.' };

  const title   = (formData.get('title') as string).trim();
  const amount  = parseFloat(formData.get('amount') as string);
  const currency = (formData.get('currency') as string).trim();
  const deadline = (formData.get('deadline') as string).trim();
  const purpose  = (formData.get('purpose') as string).trim();
  const payee    = (formData.get('payee') as string).trim();

  if (!title || isNaN(amount) || !deadline || !purpose || !payee) {
    return { ok: false, error: 'All fields are required.' };
  }

  await getDb().updateRequest(id, { title, amount, currency, deadline, purpose, payee });
  revalidatePath('/requests');
  revalidatePath(`/requests/${id}`);
  revalidatePath('/dashboard');
  return { ok: true };
}
