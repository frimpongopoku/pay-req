import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/db';
import { ASSETS, REQUESTS, USERS, ACTIVITY } from '@/lib/data';

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed is disabled in production.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') ?? '';

  const db = getDb();

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

  for (const a of ACTIVITY) {
    await db.addActivity(orgId, {
      who: a.who,
      what: a.what,
      tag: a.tag,
      avHue: a.avHue ?? undefined,
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
