import type { Asset, Request, RequestFilters, ActivityItem, User, Organisation, Invite } from './types';

/**
 * Storage-agnostic data access interface.
 * Swap implementations by changing DB_PROVIDER env var — pages never change.
 * Current implementations: firestore
 * Planned: postgres
 */
export interface IRepository {
  // ── Organisations ─────────────────────────────────────────────────────────
  createOrg(data: Omit<Organisation, 'id'>): Promise<Organisation>;
  getOrg(id: string): Promise<Organisation | null>;
  updateOrg(id: string, patch: Partial<Omit<Organisation, 'id'>>): Promise<Organisation | null>;

  // ── Requests ──────────────────────────────────────────────────────────────
  listRequests(orgId: string, filters?: RequestFilters): Promise<Request[]>;
  getRequest(id: string): Promise<Request | null>;
  createRequest(data: Omit<Request, 'id'>): Promise<Request>;
  updateRequest(id: string, patch: Partial<Omit<Request, 'id'>>): Promise<Request | null>;
  upsertRequest(id: string, data: Omit<Request, 'id'>): Promise<Request>;
  deleteRequest(id: string): Promise<void>;

  // ── Assets ────────────────────────────────────────────────────────────────
  listAssets(orgId: string): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | null>;
  createAsset(data: Omit<Asset, 'id'>): Promise<Asset>;
  updateAsset(id: string, patch: Partial<Omit<Asset, 'id'>>): Promise<Asset | null>;
  upsertAsset(id: string, data: Omit<Asset, 'id'>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;

  // ── Users ─────────────────────────────────────────────────────────────────
  listUsers(orgId: string): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  /** Find a user by email — used to block multi-org invites. */
  findUserByEmail(email: string): Promise<User | null>;
  upsertUser(id: string, data: Omit<User, 'id'>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // ── Activity ──────────────────────────────────────────────────────────────
  listActivity(orgId: string, limit?: number): Promise<ActivityItem[]>;
  /** Timestamp is set automatically by the implementation. */
  addActivity(orgId: string, item: Omit<ActivityItem, 'id' | 'ts' | 'orgId'>): Promise<void>;

  // ── Invites ───────────────────────────────────────────────────────────────
  listInvites(orgId: string): Promise<Invite[]>;
  createInvite(data: Omit<Invite, 'id'>): Promise<Invite>;
  /** Find any pending invite for an email address across all orgs. */
  findInviteByEmail(email: string): Promise<Invite | null>;
  deleteInvite(id: string): Promise<void>;
}
