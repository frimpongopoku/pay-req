'use client';
import { useState, useTransition } from 'react';
import { RowMenu } from '@/components/ui/RowMenu';
import { EditAssetModal } from './EditAssetModal';
import { deleteAsset } from '../actions';
import type { Asset } from '@/lib/db';

type ManagerOption = { id: string; name: string; role: string };

interface Props {
  asset: Asset;
  managers: ManagerOption[];
}

export function AssetMenu({ asset, managers }: Props) {
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <>
      <RowMenu
        items={[
          {
            label: 'Edit asset',
            onClick: () => setEditing(true),
          },
          {
            label: 'Delete asset',
            danger: true,
            onClick: () => {
              if (!confirm(`Delete "${asset.name}"? This cannot be undone.`)) return;
              startTransition(async () => { await deleteAsset(asset.id); });
            },
          },
        ]}
      />
      {editing && (
        <EditAssetModal asset={asset} managers={managers} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
