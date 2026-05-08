import postgres from 'postgres';
import type { IRepository } from '../repository';
import type { Asset, AssetType, Request, RequestFilters, ActivityItem, User, Organisation, Invite } from '../types';

// In dev, HMR re-evaluates this module on every change, creating a new pool
// each time and exhausting Postgres's max_connections. Stash the pool on the
// global object so it survives module re-evaluation.
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: ReturnType<typeof postgres> | undefined;
}

function db() {
  if (!global.__pgPool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not configured.');
    global.__pgPool = postgres(url, { max: 10, idle_timeout: 20 });
  }
  return global.__pgPool;
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h ago`;
  const d = Math.floor(hr / 24);
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

// camelCase → snake_case column mapper for UPDATE patches
const REQUEST_COL: Record<string, string> = {
  orgId: 'org_id', requesterUid: 'requester_uid',
  submittedAt: 'submitted_at', additionalDetails: 'additional_details',
  payeeDetails: 'payee_details', excluded: 'excluded',
};
const ASSET_COL: Record<string, string> = { orgId: 'org_id', details: 'details', tags: 'tags', excluded: 'excluded' };
const USER_COL: Record<string, string> = { orgId: 'org_id' };

function toSnake(obj: Record<string, unknown>, map: Record<string, string>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[map[k] ?? k] = v;
  }
  return out;
}

// Row → domain type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrg(r: any): Organisation {
  return {
    id: r.id, name: r.name, ownerUid: r.owner_uid, createdAt: r.created_at, currency: r.currency ?? 'GHS',
    slackWebhook: r.slack_webhook ?? undefined,
    slackChannel: r.slack_channel ?? undefined,
    slackEvents: r.slack_events ?? undefined,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUser(r: any): User {
  return {
    id: r.id, name: r.name, email: r.email, role: r.role,
    orgId: r.org_id ?? undefined, depot: r.depot ?? '', hue: r.hue ?? 0,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAsset(r: any): Asset {
  return {
    id: r.id, orgId: r.org_id, name: r.name, tag: r.tag,
    type: (r.type ?? 'other') as AssetType,
    details: r.details ?? {},
    tags: r.tags ?? [],
    managers: r.managers ?? [], slack: r.slack ?? null,
    excluded: r.excluded ?? false,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRequest(r: any): Request {
  return {
    id: r.id, orgId: r.org_id, asset: r.asset, title: r.title,
    amount: parseFloat(r.amount), currency: r.currency,
    requester: r.requester, requesterUid: r.requester_uid ?? undefined,
    status: r.status, deadline: r.deadline, submitted: r.submitted,
    submittedAt: r.submitted_at ?? undefined,
    purpose: r.purpose, payee: r.payee,
    attachments: r.attachments ?? [], priority: r.priority,
    additionalDetails: r.additional_details ?? undefined,
    payeeDetails: r.payee_details ?? undefined,
    excluded: r.excluded ?? false,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToActivity(r: any): ActivityItem {
  return {
    id: r.id, orgId: r.org_id, who: r.who, what: r.what,
    ts: relativeTime(new Date(r.ts)), tag: r.tag, avHue: r.av_hue ?? undefined,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToInvite(r: any): Invite {
  return { id: r.id, email: r.email, orgId: r.org_id, role: r.role, invitedBy: r.invited_by, createdAt: r.created_at };
}

export class PostgresRepository implements IRepository {

  // ── Organisations ─────────────────────────────────────────────────────────

  async createOrg(data: Omit<Organisation, 'id'>): Promise<Organisation> {
    const id = crypto.randomUUID();
    const currency = data.currency ?? 'GHS';
    await db()`
      INSERT INTO organisations (id, name, owner_uid, created_at, currency)
      VALUES (${id}, ${data.name}, ${data.ownerUid}, ${data.createdAt}, ${currency})
    `;
    return { id, ...data, currency };
  }

  async getOrg(id: string): Promise<Organisation | null> {
    const rows = await db()`SELECT * FROM organisations WHERE id = ${id}`;
    return rows.length ? rowToOrg(rows[0]) : null;
  }

  async updateOrg(id: string, patch: Partial<Omit<Organisation, 'id'>>): Promise<Organisation | null> {
    const ORG_COL: Record<string, string> = {
      ownerUid: 'owner_uid', createdAt: 'created_at',
      slackWebhook: 'slack_webhook', slackChannel: 'slack_channel', slackEvents: 'slack_events',
    };
    const mapped = toSnake(patch as Record<string, unknown>, ORG_COL);
    if (!Object.keys(mapped).length) return this.getOrg(id);
    await db()`UPDATE organisations SET ${db()(mapped)} WHERE id = ${id}`;
    return this.getOrg(id);
  }

  async deleteOrg(id: string): Promise<void> {
    const sql = db();
    await sql`DELETE FROM invites  WHERE org_id = ${id}`;
    await sql`DELETE FROM activity WHERE org_id = ${id}`;
    await sql`DELETE FROM requests WHERE org_id = ${id}`;
    await sql`DELETE FROM assets   WHERE org_id = ${id}`;
    await sql`UPDATE users SET org_id = NULL WHERE org_id = ${id}`;
    await sql`DELETE FROM organisations WHERE id = ${id}`;
  }

  // ── Requests ──────────────────────────────────────────────────────────────

  async listRequests(orgId: string, filters?: RequestFilters): Promise<Request[]> {
    const sql = db();
    const statuses = filters?.status
      ? (Array.isArray(filters.status) ? filters.status : [filters.status])
      : null;

    let rows;
    if (statuses && filters?.asset) {
      rows = await sql`SELECT * FROM requests WHERE org_id = ${orgId} AND status = ANY(${statuses}) AND asset = ${filters.asset}`;
    } else if (statuses && filters?.requester) {
      rows = await sql`SELECT * FROM requests WHERE org_id = ${orgId} AND status = ANY(${statuses}) AND requester = ${filters.requester}`;
    } else if (statuses) {
      rows = await sql`SELECT * FROM requests WHERE org_id = ${orgId} AND status = ANY(${statuses})`;
    } else if (filters?.asset) {
      rows = await sql`SELECT * FROM requests WHERE org_id = ${orgId} AND asset = ${filters.asset}`;
    } else if (filters?.requester) {
      rows = await sql`SELECT * FROM requests WHERE org_id = ${orgId} AND requester = ${filters.requester}`;
    } else {
      rows = await sql`SELECT * FROM requests WHERE org_id = ${orgId}`;
    }
    return rows.map(rowToRequest);
  }

  async getRequest(id: string): Promise<Request | null> {
    const rows = await db()`SELECT * FROM requests WHERE id = ${id}`;
    return rows.length ? rowToRequest(rows[0]) : null;
  }

  async createRequest(data: Omit<Request, 'id'>): Promise<Request> {
    const sql = db();
    const [{ count }] = await sql`SELECT COUNT(*) AS count FROM requests`;
    const id = `REQ-${String(2500 + Number(count) + 1).padStart(4, '0')}`;
    await sql`
      INSERT INTO requests (
        id, org_id, asset, title, amount, currency, requester, requester_uid,
        status, deadline, submitted, submitted_at, purpose, payee,
        attachments, priority, additional_details, payee_details
      ) VALUES (
        ${id}, ${data.orgId}, ${data.asset}, ${data.title}, ${data.amount},
        ${data.currency}, ${data.requester}, ${data.requesterUid ?? null},
        ${data.status}, ${data.deadline}, ${data.submitted}, ${data.submittedAt ?? null},
        ${data.purpose}, ${data.payee}, ${data.attachments}, ${data.priority},
        ${data.additionalDetails ?? null},
        ${sql.json(data.payeeDetails ?? {} as unknown as never)}
      )
    `;
    return { id, ...data };
  }

  async updateRequest(id: string, patch: Partial<Omit<Request, 'id'>>): Promise<Request | null> {
    const mapped = toSnake(patch as Record<string, unknown>, REQUEST_COL);
    if (!Object.keys(mapped).length) return this.getRequest(id);
    await db()`UPDATE requests SET ${db()(mapped)} WHERE id = ${id}`;
    return this.getRequest(id);
  }

  async deleteRequest(id: string): Promise<void> {
    await db()`DELETE FROM requests WHERE id = ${id}`;
  }

  async upsertRequest(id: string, data: Omit<Request, 'id'>): Promise<Request> {
    await db()`
      INSERT INTO requests (
        id, org_id, asset, title, amount, currency, requester, requester_uid,
        status, deadline, submitted, submitted_at, purpose, payee,
        attachments, priority, additional_details, payee_details
      ) VALUES (
        ${id}, ${data.orgId}, ${data.asset}, ${data.title}, ${data.amount},
        ${data.currency}, ${data.requester}, ${data.requesterUid ?? null},
        ${data.status}, ${data.deadline}, ${data.submitted}, ${data.submittedAt ?? null},
        ${data.purpose}, ${data.payee}, ${data.attachments}, ${data.priority},
        ${data.additionalDetails ?? null},
        ${db().json(data.payeeDetails ?? {} as unknown as never)}
      )
      ON CONFLICT (id) DO UPDATE SET
        org_id = EXCLUDED.org_id, asset = EXCLUDED.asset, title = EXCLUDED.title,
        amount = EXCLUDED.amount, currency = EXCLUDED.currency,
        requester = EXCLUDED.requester, requester_uid = EXCLUDED.requester_uid,
        status = EXCLUDED.status, deadline = EXCLUDED.deadline,
        submitted = EXCLUDED.submitted, submitted_at = EXCLUDED.submitted_at,
        purpose = EXCLUDED.purpose, payee = EXCLUDED.payee,
        attachments = EXCLUDED.attachments, priority = EXCLUDED.priority,
        additional_details = EXCLUDED.additional_details,
        payee_details = EXCLUDED.payee_details
    `;
    return { id, ...data };
  }

  // ── Assets ────────────────────────────────────────────────────────────────

  async listAssets(orgId: string): Promise<Asset[]> {
    const rows = await db()`SELECT * FROM assets WHERE org_id = ${orgId}`;
    return rows.map(rowToAsset);
  }

  async getAsset(id: string): Promise<Asset | null> {
    const rows = await db()`SELECT * FROM assets WHERE id = ${id}`;
    return rows.length ? rowToAsset(rows[0]) : null;
  }

  async createAsset(data: Omit<Asset, 'id'>): Promise<Asset> {
    const id = crypto.randomUUID();
    await db()`
      INSERT INTO assets (id, org_id, name, tag, type, details, tags, managers, slack)
      VALUES (
        ${id}, ${data.orgId}, ${data.name}, ${data.tag},
        ${data.type ?? 'other'},
        ${db().json(data.details ?? {} as unknown as never)},
        ${data.tags ?? []},
        ${data.managers}, ${data.slack ?? null}
      )
    `;
    return { id, ...data };
  }

  async updateAsset(id: string, patch: Partial<Omit<Asset, 'id'>>): Promise<Asset | null> {
    const raw = patch as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (raw.details) raw.details = db().json(raw.details as any);
    const mapped = toSnake(raw, ASSET_COL);
    if (!Object.keys(mapped).length) return this.getAsset(id);
    await db()`UPDATE assets SET ${db()(mapped)} WHERE id = ${id}`;
    return this.getAsset(id);
  }

  async deleteAsset(id: string): Promise<void> {
    await db()`DELETE FROM assets WHERE id = ${id}`;
  }

  async upsertAsset(id: string, data: Omit<Asset, 'id'>): Promise<Asset> {
    await db()`
      INSERT INTO assets (id, org_id, name, tag, type, details, tags, managers, slack)
      VALUES (
        ${id}, ${data.orgId}, ${data.name}, ${data.tag},
        ${data.type ?? 'other'},
        ${db().json(data.details ?? {} as unknown as never)},
        ${data.tags ?? []},
        ${data.managers}, ${data.slack ?? null}
      )
      ON CONFLICT (id) DO UPDATE SET
        org_id = EXCLUDED.org_id, name = EXCLUDED.name, tag = EXCLUDED.tag,
        type = EXCLUDED.type, details = EXCLUDED.details, tags = EXCLUDED.tags,
        managers = EXCLUDED.managers, slack = EXCLUDED.slack
    `;
    return { id, ...data };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async listUsers(orgId: string): Promise<User[]> {
    const rows = await db()`SELECT * FROM users WHERE org_id = ${orgId}`;
    return rows.map(rowToUser);
  }

  async getUser(id: string): Promise<User | null> {
    const rows = await db()`SELECT * FROM users WHERE id = ${id}`;
    return rows.length ? rowToUser(rows[0]) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const rows = await db()`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    return rows.length ? rowToUser(rows[0]) : null;
  }

  async upsertUser(id: string, data: Omit<User, 'id'>): Promise<User> {
    await db()`
      INSERT INTO users (id, name, email, role, org_id, depot, hue)
      VALUES (${id}, ${data.name}, ${data.email}, ${data.role}, ${data.orgId ?? null}, ${data.depot}, ${data.hue})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role,
        org_id = EXCLUDED.org_id, depot = EXCLUDED.depot, hue = EXCLUDED.hue
    `;
    return { id, ...data };
  }

  async deleteUser(id: string): Promise<void> {
    await db()`DELETE FROM users WHERE id = ${id}`;
  }

  // ── Activity ──────────────────────────────────────────────────────────────

  async listActivity(orgId: string, limit = 20): Promise<ActivityItem[]> {
    const rows = await db()`
      SELECT * FROM activity WHERE org_id = ${orgId} ORDER BY ts DESC LIMIT ${limit}
    `;
    return rows.map(rowToActivity);
  }

  async addActivity(orgId: string, item: Omit<ActivityItem, 'id' | 'ts' | 'orgId'>): Promise<void> {
    const id = crypto.randomUUID();
    await db()`
      INSERT INTO activity (id, org_id, who, what, ts, tag, av_hue)
      VALUES (${id}, ${orgId}, ${item.who}, ${item.what}, NOW(), ${item.tag}, ${item.avHue ?? null})
    `;
  }

  // ── Invites ───────────────────────────────────────────────────────────────

  async listInvites(orgId: string): Promise<Invite[]> {
    const rows = await db()`SELECT * FROM invites WHERE org_id = ${orgId}`;
    return rows.map(rowToInvite);
  }

  async createInvite(data: Omit<Invite, 'id'>): Promise<Invite> {
    const id = crypto.randomUUID();
    await db()`
      INSERT INTO invites (id, email, org_id, role, invited_by, created_at)
      VALUES (${id}, ${data.email}, ${data.orgId}, ${data.role}, ${data.invitedBy}, ${data.createdAt})
    `;
    return { id, ...data };
  }

  async findInviteByEmail(email: string): Promise<Invite | null> {
    const rows = await db()`SELECT * FROM invites WHERE email = ${email} LIMIT 1`;
    return rows.length ? rowToInvite(rows[0]) : null;
  }

  async deleteInvite(id: string): Promise<void> {
    await db()`DELETE FROM invites WHERE id = ${id}`;
  }
}
