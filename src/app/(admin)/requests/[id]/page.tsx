import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { RequestDetail } from './_components/RequestDetail';

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const user = await getSessionUser();
  const orgId = user?.orgId ?? '';

  const [request, assets, allRequests] = await Promise.all([
    db.getRequest(id),
    db.listAssets(orgId),
    db.listRequests(orgId),
  ]);

  if (!request) notFound();

  const asset = assets.find(a => a.id === request.asset);
  if (!asset) notFound();

  const assetRequests = allRequests.filter(r => r.asset === asset.id && r.status !== 'DENIED');
  const assetSpend = assetRequests.reduce((sum, r) => sum + r.amount, 0);
  const assetOpenCount = assetRequests.filter(r => !['COMPLETED'].includes(r.status)).length;

  return (
    <RequestDetail
      request={request}
      asset={asset}
      assetSpend={assetSpend}
      assetOpenCount={assetOpenCount}
    />
  );
}
