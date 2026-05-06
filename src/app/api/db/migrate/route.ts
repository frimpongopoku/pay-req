import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Migrate is disabled in production.' }, { status: 403 });
  }

  const sql = postgres(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS organisations (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      owner_uid   TEXT NOT NULL,
      created_at  TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id      TEXT PRIMARY KEY,
      name    TEXT NOT NULL,
      email   TEXT NOT NULL,
      role    TEXT NOT NULL DEFAULT 'Employee',
      org_id  TEXT,
      depot   TEXT NOT NULL DEFAULT '',
      hue     INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS assets (
      id        TEXT PRIMARY KEY,
      org_id    TEXT NOT NULL,
      name      TEXT NOT NULL,
      tag       TEXT NOT NULL DEFAULT '',
      managers  TEXT[] NOT NULL DEFAULT '{}',
      slack     TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS requests (
      id                 TEXT PRIMARY KEY,
      org_id             TEXT NOT NULL,
      asset              TEXT NOT NULL,
      title              TEXT NOT NULL,
      amount             NUMERIC(12,2) NOT NULL,
      currency           TEXT NOT NULL DEFAULT 'USD',
      requester          TEXT NOT NULL,
      requester_uid      TEXT,
      status             TEXT NOT NULL DEFAULT 'SUBMITTED',
      deadline           TEXT NOT NULL,
      submitted          TEXT NOT NULL,
      submitted_at       TEXT,
      purpose            TEXT NOT NULL DEFAULT '',
      payee              TEXT NOT NULL DEFAULT '',
      attachments        TEXT[] NOT NULL DEFAULT '{}',
      priority           TEXT NOT NULL DEFAULT 'med',
      additional_details TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS activity (
      id      TEXT PRIMARY KEY,
      org_id  TEXT NOT NULL,
      who     TEXT NOT NULL,
      what    TEXT NOT NULL,
      ts      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      tag     TEXT NOT NULL DEFAULT '',
      av_hue  INTEGER
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS activity_org_ts ON activity (org_id, ts DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS invites (
      id          TEXT PRIMARY KEY,
      email       TEXT NOT NULL,
      org_id      TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'Employee',
      invited_by  TEXT NOT NULL,
      created_at  TEXT NOT NULL
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS requests_org ON requests (org_id)`;
  await sql`CREATE INDEX IF NOT EXISTS assets_org ON assets (org_id)`;
  await sql`CREATE INDEX IF NOT EXISTS users_org ON users (org_id)`;
  await sql`CREATE INDEX IF NOT EXISTS invites_org ON invites (org_id)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS invites_email ON invites (email)`;

  await sql`ALTER TABLE organisations ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'GHS'`;
  await sql`ALTER TABLE assets ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'other'`;
  await sql`ALTER TABLE assets ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'`;
  await sql`ALTER TABLE assets ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'`;

  await sql.end();
  return NextResponse.json({ ok: true, message: 'All tables created.' });
}
