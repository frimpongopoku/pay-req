//
// Caching layer for read-only DB queries.
//
// HOW TO REVERT: set CACHE_ENABLED = false below.
// Every method falls straight through to the DB — no other code changes needed.
//
// HOW IT WORKS:
// - Pages call getOrgCache(orgId).listRequests() etc. instead of getDb().listRequests(orgId)
// - Results are cached in Next.js server memory, keyed per org, for up to TTL seconds
// - Any write (server action) calls invalidateOrgCache(orgId) to bust the cache immediately
// - TTL is a safety net — tagged invalidation is the primary mechanism
//
import { unstable_cache, revalidateTag } from 'next/cache';
import { getDb } from './index';
import type { RequestFilters } from './types';

const CACHE_ENABLED = true;
const TTL = 60; // seconds

export const orgTag = (orgId: string) => `org:${orgId}`;

/** Call this inside every server action that mutates org data. */
export function invalidateOrgCache(orgId: string) {
  revalidateTag(orgTag(orgId));
}

/**
 * Returns cached read methods scoped to a single org.
 * Writes still go directly through getDb() — only reads are cached.
 */
export function getOrgCache(orgId: string) {
  const db = getDb();

  if (!CACHE_ENABLED) {
    return {
      listRequests: (f?: RequestFilters) => db.listRequests(orgId, f),
      listAssets:   ()                   => db.listAssets(orgId),
      getOrg:       ()                   => db.getOrg(orgId),
      listUsers:    ()                   => db.listUsers(orgId),
      listActivity: (limit?: number)     => db.listActivity(orgId, limit),
      listInvites:  ()                   => db.listInvites(orgId),
    };
  }

  const tag = orgTag(orgId);

  return {
    listRequests: unstable_cache(
      (f?: RequestFilters) => db.listRequests(orgId, f),
      [`${orgId}:requests`],
      { tags: [tag], revalidate: TTL },
    ),
    listAssets: unstable_cache(
      () => db.listAssets(orgId),
      [`${orgId}:assets`],
      { tags: [tag], revalidate: TTL },
    ),
    getOrg: unstable_cache(
      () => db.getOrg(orgId),
      [`${orgId}:org`],
      { tags: [tag], revalidate: TTL },
    ),
    listUsers: unstable_cache(
      () => db.listUsers(orgId),
      [`${orgId}:users`],
      { tags: [tag], revalidate: TTL },
    ),
    listActivity: unstable_cache(
      (limit?: number) => db.listActivity(orgId, limit),
      [`${orgId}:activity`],
      { tags: [tag], revalidate: TTL },
    ),
    listInvites: unstable_cache(
      () => db.listInvites(orgId),
      [`${orgId}:invites`],
      { tags: [tag], revalidate: TTL },
    ),
  };
}
