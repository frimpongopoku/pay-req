import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { CreateForm } from './_components/CreateForm';

export default async function MobileCreatePage() {
  const user = await getSessionUser();
  const db = getDb();
  const orgId = user?.orgId ?? '';

  const [assets, allRequests, org] = await Promise.all([
    db.listAssets(orgId),
    db.listRequests(orgId),
    orgId ? db.getOrg(orgId) : null,
  ]);

  const myRequests = allRequests.filter(r =>
    r.requesterUid === user?.id || r.requester === user?.name
  );
  const seenNames = new Set<string>();
  const vendors: { name: string; details?: import('@/lib/db/types').PayeeDetails }[] = [];
  for (const r of [...myRequests].reverse()) {
    if (r.payee && !seenNames.has(r.payee)) {
      seenNames.add(r.payee);
      vendors.push({ name: r.payee, details: r.payeeDetails });
    }
  }
  vendors.reverse();
  const currency = org?.currency ?? 'GHS';

  return <CreateForm assets={assets} vendors={vendors} currency={currency} />;
}
