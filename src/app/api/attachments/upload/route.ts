import { NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/session';

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user?.orgId) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 20 MB limit.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `attachments/${user.orgId}/${Date.now()}-${safeName}`;

  const bucket = getAdminStorage().bucket();
  const fileRef = bucket.file(path);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fileRef.save(buffer, {
    metadata: { contentType: file.type || `application/${ext}` },
  });

  await fileRef.makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

  return NextResponse.json({ url });
}
