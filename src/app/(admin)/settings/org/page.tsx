import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { OrgSettingsForm } from './_components/OrgSettingsForm';

export default async function OrgSettingsPage() {
  const user = await getSessionUser();
  const org  = user?.orgId ? await getDb().getOrg(user.orgId) : null;

  return (
    <div className="page">
      <div style={{ marginBottom: 18 }}>
        <h1 className="h1">Organisation</h1>
        <div className="muted small" style={{ marginTop: 4 }}>Manage your workspace settings</div>
      </div>
      <OrgSettingsForm org={org} />
    </div>
  );
}
