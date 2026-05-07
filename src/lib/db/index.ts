import type { IRepository } from './repository';

let _instance: IRepository | null = null;

export function getDb(): IRepository {
  if (_instance) return _instance;

  const provider = process.env.DB_PROVIDER ?? 'postgres';

  if (provider === 'postgres') {
    const { PostgresRepository } = require('./providers/postgres');
    _instance = new PostgresRepository();
  } else if (provider === 'firestore') {
    const { FirestoreRepository } = require('./providers/firestore');
    _instance = new FirestoreRepository();
  } else {
    throw new Error(`Unknown DB_PROVIDER="${provider}". Supported: firestore, postgres`);
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
  SlackEvents,
} from './types';
