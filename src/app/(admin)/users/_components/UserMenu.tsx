'use client';
import { useTransition } from 'react';
import { RowMenu } from '@/components/ui/RowMenu';
import { removeUser, changeUserRole } from '../actions';

interface Props {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}

export function UserMenu({ userId, currentRole, isSelf }: Props) {
  const [, startTransition] = useTransition();

  const roleItems: ('Admin' | 'Manager' | 'Employee')[] = ['Admin', 'Manager', 'Employee'];

  return (
    <RowMenu
      items={[
        ...roleItems
          .filter(r => r !== currentRole)
          .map(r => ({
            label: `Make ${r}`,
            disabled: isSelf,
            onClick: () => startTransition(() => changeUserRole(userId, r)),
          })),
        {
          label: 'Remove from org',
          danger: true,
          disabled: isSelf,
          onClick: () => {
            if (!confirm('Remove this person from the org?')) return;
            startTransition(() => removeUser(userId));
          },
        },
      ]}
    />
  );
}
