import { getDb } from '@/lib/db';

export type SlackEvent = 'new_request' | 'status_change' | 'receipt_submission';

export interface SlackNotifyData {
  requestId: string;
  title: string;
  amount: number;
  currency: string;
  requester: string;
  deadline: string;
  priority: string;
  assetName: string;
  assetSlack?: string | null;
  toStatus?: string;
  prevStatus?: string;
  purpose?: string;
  payeeDetails?: import('./db/types').PayeeDetails;
}

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  PAID: 'Paid',
  RECEIPTS_SUBMITTED: 'Receipts Submitted',
  COMPLETED: 'Completed',
  DENIED: 'Denied',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: '🔴 High', med: '🟡 Medium', low: '🟢 Low',
};

const EVENT_EMOJI: Record<SlackEvent, string> = {
  new_request: '📋',
  status_change: '🔄',
  receipt_submission: '📎',
};

function buildBlocks(event: SlackEvent, data: SlackNotifyData) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
  const requestUrl = appUrl ? `${appUrl}/requests/${data.requestId}` : null;

  let headerText = '';

  if (event === 'new_request') {
    headerText = `${EVENT_EMOJI[event]} New request on *${data.assetName}*`;
  } else if (event === 'status_change') {
    const to = STATUS_LABELS[data.toStatus ?? ''] ?? data.toStatus ?? '';
    headerText = `${EVENT_EMOJI[event]} ${data.requestId} → *${to}*`;
  } else {
    headerText = `${EVENT_EMOJI[event]} Receipts submitted on *${data.requestId}*`;
  }

  const fields: object[] = [
    { type: 'mrkdwn', text: `*Amount*\n${data.currency} ${data.amount.toLocaleString()}` },
    { type: 'mrkdwn', text: `*Requester*\n${data.requester}` },
    { type: 'mrkdwn', text: `*Deadline*\n${data.deadline}` },
    { type: 'mrkdwn', text: `*Priority*\n${PRIORITY_LABELS[data.priority] ?? data.priority}` },
  ];
  if (data.purpose) {
    fields.push({ type: 'mrkdwn', text: `*Description*\n${data.purpose}` });
  }

  const blocks: object[] = [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: headerText },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*${data.title}*` },
    },
    {
      type: 'section',
      fields,
    },
  ];

  if (data.payeeDetails?.method) {
    const pd = data.payeeDetails;
    let recipientLines = '';
    if (pd.method === 'momo') {
      recipientLines = [
        `*Network:* ${pd.momoNetwork ?? '—'}`,
        `*Number:* ${pd.momoNumber ?? '—'}`,
        pd.momoName ? `*Account name:* ${pd.momoName}` : null,
      ].filter(Boolean).join('   |   ');
    } else if (pd.method === 'bank') {
      recipientLines = [
        `*Bank:* ${pd.bankName ?? '—'}`,
        `*Account no:* ${pd.accountNumber ?? '—'}`,
        pd.accountName ? `*Account name:* ${pd.accountName}` : null,
      ].filter(Boolean).join('   |   ');
    } else {
      recipientLines = pd.reference ? `*Reference:* ${pd.reference}` : '';
    }
    if (recipientLines) {
      const methodLabel = pd.method === 'momo' ? '📱 Mobile Money' : pd.method === 'bank' ? '🏦 Bank Transfer' : '💳 Other';
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Recipient payment details* — ${methodLabel}\n${recipientLines}` },
      });
      blocks.push({ type: 'divider' });
    }
  }

  if (!data.payeeDetails?.method) {
    blocks.push({ type: 'divider' });
  }

  if (requestUrl) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `👉 *<${requestUrl}|Review this request in PayReq>*` },
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: requestUrl ? `${data.requestId} · ${requestUrl}` : `${data.requestId} — set NEXT_PUBLIC_APP_URL in Vercel env vars to get a direct link` },
    ],
  });

  return blocks;
}

export async function notify(
  orgId: string,
  event: SlackEvent,
  data: SlackNotifyData,
): Promise<void> {
  try {
    const org = await getDb().getOrg(orgId);
    if (!org?.slackWebhook) return;

    const events = org.slackEvents ?? { new_request: true, status_change: true, receipt_submission: true };
    if (!events[event]) return;

    const blocks = buildBlocks(event, data);

    const res = await fetch(org.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks, unfurl_links: false, unfurl_media: false }),
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[slack] webhook returned ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error('[slack] notify failed:', err);
  }
}

export async function testWebhook(webhookUrl: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '✅ *PayReq webhook test* — connection is working!',
            },
          },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
