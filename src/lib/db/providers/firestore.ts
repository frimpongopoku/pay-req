import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';
import type { IRepository } from '../repository';
import type { Asset, Request, RequestFilters, ActivityItem, User, Organisation, Invite } from '../types';

function fs() {
  return getFirestore(getAdminApp());
}

function toEntity<T>(doc: FirebaseFirestore.DocumentSnapshot): T | null {
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as T;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h ago`;
  const d = Math.floor(hr / 24);
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

export class FirestoreRepository implements IRepository {
  // ── Organisations ─────────────────────────────────────────────────────────

  async createOrg(data: Omit<Organisation, 'id'>): Promise<Organisation> {
    const ref = await fs().collection('orgs').add(data);
    return { id: ref.id, ...data };
  }

  async getOrg(id: string): Promise<Organisation | null> {
    return toEntity<Organisation>(await fs().collection('orgs').doc(id).get());
  }

  // ── Requests ──────────────────────────────────────────────────────────────

  async listRequests(orgId: string, filters?: RequestFilters): Promise<Request[]> {
    let q: FirebaseFirestore.Query = fs().collection('requests').where('orgId', '==', orgId);

    const statuses = filters?.status
      ? Array.isArray(filters.status) ? filters.status : [filters.status]
      : null;

    if (statuses?.length === 1) q = q.where('status', '==', statuses[0]);
    if (statuses && statuses.length > 1) q = q.where('status', 'in', statuses);
    if (filters?.asset) q = q.where('asset', '==', filters.asset);
    if (filters?.requester) q = q.where('requester', '==', filters.requester);

    const snap = await q.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Request));
  }

  async getRequest(id: string): Promise<Request | null> {
    return toEntity<Request>(await fs().collection('requests').doc(id).get());
  }

  async createRequest(data: Omit<Request, 'id'>): Promise<Request> {
    const count = (await fs().collection('requests').count().get()).data().count;
    const id = `REQ-${String(2500 + count + 1).padStart(4, '0')}`;
    await fs().collection('requests').doc(id).set(data);
    return { id, ...data };
  }

  async updateRequest(id: string, patch: Partial<Omit<Request, 'id'>>): Promise<Request | null> {
    const ref = fs().collection('requests').doc(id);
    await ref.update(patch as FirebaseFirestore.UpdateData<Omit<Request, 'id'>>);
    return toEntity<Request>(await ref.get());
  }

  async upsertRequest(id: string, data: Omit<Request, 'id'>): Promise<Request> {
    await fs().collection('requests').doc(id).set(data);
    return { id, ...data };
  }

  // ── Assets ────────────────────────────────────────────────────────────────

  async listAssets(orgId: string): Promise<Asset[]> {
    const snap = await fs().collection('assets').where('orgId', '==', orgId).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Asset));
  }

  async getAsset(id: string): Promise<Asset | null> {
    return toEntity<Asset>(await fs().collection('assets').doc(id).get());
  }

  async createAsset(data: Omit<Asset, 'id'>): Promise<Asset> {
    const ref = await fs().collection('assets').add(data);
    return { id: ref.id, ...data };
  }

  async updateAsset(id: string, patch: Partial<Omit<Asset, 'id'>>): Promise<Asset | null> {
    const ref = fs().collection('assets').doc(id);
    await ref.update(patch as FirebaseFirestore.UpdateData<Omit<Asset, 'id'>>);
    return toEntity<Asset>(await ref.get());
  }

  async upsertAsset(id: string, data: Omit<Asset, 'id'>): Promise<Asset> {
    await fs().collection('assets').doc(id).set(data);
    return { id, ...data };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async listUsers(orgId: string): Promise<User[]> {
    const snap = await fs().collection('users').where('orgId', '==', orgId).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
  }

  async getUser(id: string): Promise<User | null> {
    return toEntity<User>(await fs().collection('users').doc(id).get());
  }

  async upsertUser(id: string, data: Omit<User, 'id'>): Promise<User> {
    await fs().collection('users').doc(id).set(data, { merge: true });
    return { id, ...data };
  }

  // ── Activity ──────────────────────────────────────────────────────────────

  async listActivity(orgId: string, limit = 20): Promise<ActivityItem[]> {
    const snap = await fs()
      .collection('activity')
      .where('orgId', '==', orgId)
      .orderBy('_ts', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map(d => {
      const data = d.data();
      const iso: string = data._ts instanceof Timestamp
        ? data._ts.toDate().toISOString()
        : (data._ts ?? new Date().toISOString());
      return {
        id: d.id,
        orgId: data.orgId,
        who: data.who,
        what: data.what,
        ts: relativeTime(iso),
        tag: data.tag,
        avHue: data.avHue ?? null,
      } as ActivityItem;
    });
  }

  async addActivity(orgId: string, item: Omit<ActivityItem, 'id' | 'ts' | 'orgId'>): Promise<void> {
    await fs().collection('activity').add({
      ...item,
      orgId,
      _ts: Timestamp.now(),
    });
  }

  // ── Invites ───────────────────────────────────────────────────────────────

  async listInvites(orgId: string): Promise<Invite[]> {
    const snap = await fs().collection('invites').where('orgId', '==', orgId).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Invite));
  }

  async createInvite(data: Omit<Invite, 'id'>): Promise<Invite> {
    const ref = await fs().collection('invites').add(data);
    return { id: ref.id, ...data };
  }

  async findInviteByEmail(email: string): Promise<Invite | null> {
    const snap = await fs().collection('invites').where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Invite;
  }

  async deleteInvite(id: string): Promise<void> {
    await fs().collection('invites').doc(id).delete();
  }
}
