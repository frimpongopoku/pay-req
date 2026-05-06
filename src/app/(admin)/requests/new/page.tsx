import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { NewRequestForm } from './_components/NewRequestForm';

export default async function NewRequestPage() {
  const user = await getSessionUser();
  const assets = await getDb().listAssets(user?.orgId ?? '');
  return <NewRequestForm assets={assets} />;
}
