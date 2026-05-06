import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { CreateForm } from './_components/CreateForm';

export default async function MobileCreatePage() {
  const user = await getSessionUser();
  const assets = await getDb().listAssets(user?.orgId ?? '');
  return <CreateForm assets={assets} />;
}
