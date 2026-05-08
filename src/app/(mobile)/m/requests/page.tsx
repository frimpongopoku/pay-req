import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { getOrgCache } from '@/lib/db/cached';
import { RequestsList } from './_components/RequestsList';

export default async function MobileRequestsPage() {
  const user = await getSessionUser();
  const orgId = user?.orgId ?? '';
  const cache = getOrgCache(orgId);
  const [allRequests, assets] = await Promise.all([
    cache.listRequests(),
    cache.listAssets(),
  ]);

  const myRequests = allRequests
    .filter(r => r.requesterUid === user?.id || r.requester === user?.name)
    .sort((a, b) => (b.submittedAt ?? b.submitted).localeCompare(a.submittedAt ?? a.submitted));

  const assetMap = Object.fromEntries(assets.map(a => [a.id, a]));

  return <RequestsList requests={myRequests} assetMap={assetMap} />;
}
