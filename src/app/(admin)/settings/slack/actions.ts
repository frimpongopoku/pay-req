'use server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { testWebhook } from '@/lib/slack';
import type { SlackEvents } from '@/lib/db';

export async function saveSlackSettings(formData: FormData) {
  const user = await getSessionUser();
  if (!user?.orgId) throw new Error('Not authenticated');

  const webhook = (formData.get('webhook') as string).trim();
  const channel = (formData.get('channel') as string).trim();

  const slackEvents: SlackEvents = {
    new_request:        formData.get('evt_new_request') === 'on',
    status_change:      formData.get('evt_status_change') === 'on',
    receipt_submission: formData.get('evt_receipt_submission') === 'on',
  };

  await getDb().updateOrg(user.orgId, {
    slackWebhook: webhook || undefined,
    slackChannel: channel || undefined,
    slackEvents,
  });

  revalidatePath('/settings/slack');
}

export async function sendTestWebhook(webhookUrl: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user?.orgId) return { ok: false, error: 'Not authenticated' };
  return testWebhook(webhookUrl);
}
