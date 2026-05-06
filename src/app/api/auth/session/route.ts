import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { getDb } from '@/lib/db';

const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;

export async function POST(req: Request) {
  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  }

  const adminAuth = getAdminAuth();
  const db = getDb();

  // Verify the ID token to get user identity
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  // Upsert user in Firestore — preserve existing role/org, or apply a pending invite
  const existing = await db.getUser(uid);

  let role = existing?.role ?? 'Employee';
  let orgId = existing?.orgId;

  if (!orgId && decoded.email) {
    const invite = await db.findInviteByEmail(decoded.email);
    if (invite) {
      orgId = invite.orgId;
      role = invite.role;
      await db.deleteInvite(invite.id);
    }
  }

  const user = await db.upsertUser(uid, {
    name: decoded.name ?? decoded.email?.split('@')[0] ?? 'Unknown',
    email: decoded.email ?? '',
    role,
    orgId,
    depot: existing?.depot ?? '',
    hue: existing?.hue ?? (Math.abs(uid.charCodeAt(0) * 37 + uid.charCodeAt(1) * 13) % 360),
  });

  // Create the session cookie
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN });
  const res = NextResponse.json({ ok: true, role: user.role, orgId: user.orgId ?? null });
  res.cookies.set('payreq_session', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: EXPIRES_IN / 1000,
  });
  return res;
}
