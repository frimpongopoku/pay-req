import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { I } from '@/components/ui/icons';
import { RequestsTable } from './_components/RequestsTable';

export default async function RequestsPage() {
  const db = getDb();
  const user = await getSessionUser();
  const orgId = user?.orgId ?? '';
  const [requests, assets] = await Promise.all([
    db.listRequests(orgId),
    db.listAssets(orgId),
  ]);

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  return (
    <div className="page">
      <div className="row" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="h1">Requests</h1>
          <div className="muted small" style={{ marginTop: 4 }}>
            {requests.length} request{requests.length !== 1 ? 's' : ''} across {assets.length} fleet assets
          </div>
        </div>
        <div className="spacer" />
        <button className="btn">{I.filter}Filters</button>
        <button className="btn">{I.download}Export CSV</button>
        <Link href="/requests/new" className="btn primary">{I.plus}New request</Link>
      </div>

      <RequestsTable requests={requests} assetMap={assetMap} />
    </div>
  );
}
