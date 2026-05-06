import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { OnboardingForm } from './_components/OnboardingForm';

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/auth/signin');
  if (user.orgId) redirect('/dashboard');

  return <OnboardingForm userName={user.name} />;
}
