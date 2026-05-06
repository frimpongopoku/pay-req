import type { IRepository } from './repository';
import { FirestoreRepository } from './providers/firestore';

let _instance: IRepository | null = null;

/**
 * Returns the active repository implementation.
 * Switch backends by setting DB_PROVIDER env var:
 *   DB_PROVIDER=firestore  (default, current)
 *   DB_PROVIDER=postgres   (future — add PostgresRepository and register it here)
 */
export function getDb(): IRepository {
  if (_instance) return _instance;

  const provider = process.env.DB_PROVIDER ?? 'firestore';

  if (provider === 'firestore') {
    _instance = new FirestoreRepository();
  } else {
    throw new Error(`Unknown DB_PROVIDER="${provider}". Supported: firestore`);
  }

  return _instance!;
}

export type { IRepository } from './repository';
export type {
  Asset,
  Request,
  RequestFilters,
  ActivityItem,
  User,
  Organisation,
  Invite,
  KPI,
  RequestStatus,
  Priority,
  AssetStatus,
} from './types';
