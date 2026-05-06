import { cache } from 'react';
import { cookies } from 'next/headers';
import { getAdminAuth } from './firebase-admin';
import { getDb } from './db';
import type { User } from './db';

/**
 * Returns the authenticated user for the current request, or null.
 * Wrapped in React cache() so multiple server components in one request
 * share a single cookie read + Firestore lookup.
 */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const session = (await cookies()).get('payreq_session')?.value;
  if (!session) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(session, true);
    return await getDb().getUser(decoded.uid);
  } catch {
    return null;
  }
});
