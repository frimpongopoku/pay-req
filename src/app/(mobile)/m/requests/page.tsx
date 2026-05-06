import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { RequestsList } from './_components/RequestsList';

export default async function MobileRequestsPage() {
  const [user, db] = [await getSessionUser(), getDb()];
  const orgId = user?.orgId ?? '';
  const [allRequests, assets] = await Promise.all([
    db.listRequests(orgId),
    db.listAssets(orgId),
  ]);

  const myRequests = allRequests.filter(r =>
    r.requesterUid === user?.id || r.requester === user?.name
  );

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  return <RequestsList requests={myRequests} assetMap={assetMap} />;
}
