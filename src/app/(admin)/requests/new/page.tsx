import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { NewRequestForm } from './_components/NewRequestForm';

export default async function NewRequestPage() {
  const user = await getSessionUser();
  const db = getDb();
  const orgId = user?.orgId ?? '';

  const [assets, allRequests, org] = await Promise.all([
    db.listAssets(orgId),
    db.listRequests(orgId),
    orgId ? db.getOrg(orgId) : null,
  ]);

  const vendors  = [...new Set(allRequests.map(r => r.payee).filter(Boolean))];
  const currency = org?.currency ?? 'GHS';

  return <NewRequestForm assets={assets} vendors={vendors} currency={currency} />;
}
