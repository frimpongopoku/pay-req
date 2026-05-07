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

  const seenNames = new Set<string>();
  const vendors: { name: string; details?: import('@/lib/db/types').PayeeDetails }[] = [];
  for (const r of [...allRequests].reverse()) {
    if (r.payee && !seenNames.has(r.payee)) {
      seenNames.add(r.payee);
      vendors.push({ name: r.payee, details: r.payeeDetails });
    }
  }
  vendors.reverse();
  const currency = org?.currency ?? 'GHS';

  return <NewRequestForm assets={assets} vendors={vendors} currency={currency} />;
}
