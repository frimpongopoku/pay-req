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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const requestUrl = appUrl ? `${appUrl}/requests/${data.requestId}` : null;

  let headerText = '';
  let bodyText = '';

  if (event === 'new_request') {
    headerText = `${EVENT_EMOJI[event]} New request on *${data.assetName}*`;
    bodyText = `*${data.title}*`;
  } else if (event === 'status_change') {
    const to = STATUS_LABELS[data.toStatus ?? ''] ?? data.toStatus ?? '';
    headerText = `${EVENT_EMOJI[event]} ${data.requestId} → *${to}*`;
    bodyText = `*${data.title}*`;
  } else {
    headerText = `${EVENT_EMOJI[event]} Receipts submitted on *${data.requestId}*`;
    bodyText = `*${data.title}*`;
  }

  const blocks: object[] = [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: headerText },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: bodyText },
      fields: [
        { type: 'mrkdwn', text: `*Amount*\n${data.currency} ${data.amount.toLocaleString()}` },
        { type: 'mrkdwn', text: `*Requester*\n${data.requester}` },
        { type: 'mrkdwn', text: `*Deadline*\n${data.deadline}` },
        { type: 'mrkdwn', text: `*Priority*\n${PRIORITY_LABELS[data.priority] ?? data.priority}` },
      ],
    },
  ];

  if (requestUrl) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Open in PayReq ↗' },
          url: requestUrl,
          style: 'primary',
        },
      ],
    });
  }

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

    await fetch(org.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    });
  } catch {
    // Fire-and-forget — never let Slack failures break the request flow
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
