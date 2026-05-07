import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import SlackSettingsForm from './_components/SlackSettingsForm';

export default async function SlackSettingsPage() {
  const user = await getSessionUser();
  if (!user?.orgId) redirect('/auth/signin');

  const db = getDb();
  const [org, assets] = await Promise.all([
    db.getOrg(user.orgId),
    db.listAssets(user.orgId),
  ]);

  if (!org) redirect('/onboarding');

  return (
    <div className="page">
      <SlackSettingsForm org={org} assets={assets} />
    </div>
  );
}
