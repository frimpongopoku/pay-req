import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/db';
import { ASSETS, REQUESTS, USERS, ACTIVITY } from '@/lib/data';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';

// Maps the mock relative timestamps to real ISO timestamps offset from now.
const ACTIVITY_OFFSETS_MS = [4 * 60_000, 60 * 60_000, 60 * 60_000, 2 * 60 * 60_000, 4 * 60 * 60_000, 24 * 60 * 60_000];

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed is disabled in production.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') ?? '';

  const db = getDb();
  const fs = getFirestore(getAdminApp());
  const now = Date.now();

  for (const { id, ...data } of ASSETS) {
    await db.upsertAsset(id, { ...data, orgId } as Parameters<typeof db.upsertAsset>[1]);
  }

  for (const { id, ...data } of REQUESTS) {
    await db.upsertRequest(id, { ...data, orgId } as Parameters<typeof db.upsertRequest>[1]);
  }

  for (const { name, role, depot, hue } of USERS) {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    await db.upsertUser(id, { name, email: '', role: role as User['role'], depot, hue, orgId: orgId || undefined });
  }

  // Activity — write directly to set real _ts values for ordering
  const actSnap = await fs.collection('activity').get();
  const batch = fs.batch();
  actSnap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();

  for (let i = 0; i < ACTIVITY.length; i++) {
    const a = ACTIVITY[i];
    await fs.collection('activity').add({
      who: a.who,
      what: a.what,
      tag: a.tag,
      avHue: a.avHue ?? null,
      orgId: orgId || null,
      _ts: Timestamp.fromMillis(now - (ACTIVITY_OFFSETS_MS[i] ?? i * 60_000)),
    });
  }

  return NextResponse.json({
    ok: true,
    orgId: orgId || null,
    seeded: {
      assets: ASSETS.length,
      requests: REQUESTS.length,
      users: USERS.length,
      activity: ACTIVITY.length,
    },
  });
}
