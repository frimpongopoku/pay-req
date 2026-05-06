'use client';

import { useState, useTransition } from 'react';
import { I } from '@/components/ui/icons';
import { createAsset } from '../actions';

type ManagerOption = {
  id: string;
  name: string;
  role: string;
};

export function CreateAssetModal({ managers }: { managers: ManagerOption[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        {I.plus}New asset
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => !isPending && setOpen(false)}>
          <div className="modal-panel glass" onClick={e => e.stopPropagation()}>
            <div className="card-h" style={{ marginBottom: 10 }}>
              <h3>Create asset</h3>
              <div className="right">
                <button className="btn ghost" onClick={() => setOpen(false)} disabled={isPending}>
                  {I.x}Close
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                const form = e.currentTarget;
                const formData = new FormData(form);
                startTransition(async () => {
                  const res = await createAsset(formData);
                  if (!res?.ok) {
                    setError(res?.error ?? 'Could not create asset.');
                    return;
                  }
                  form.reset();
                  setOpen(false);
                });
              }}
            >
              <div className="field" style={{ marginBottom: 10 }}>
                <label>Name</label>
                <input name="name" placeholder="Truck 042" required />
              </div>

              <div className="field" style={{ marginBottom: 10 }}>
                <label>Tag</label>
                <input name="tag" placeholder="TX-7789" />
              </div>

              <div className="field" style={{ marginBottom: 10 }}>
                <label>Managers</label>
                <div className="manager-list">
                  {managers.map((m) => (
                    <label key={m.id} className="manager-item">
                      <input type="checkbox" name="managers" value={m.name} />
                      <span>{m.name}</span>
                      <span className="muted small">{m.role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label>Slack channel (optional)</label>
                <input name="slack" placeholder="#fleet-maintenance" />
              </div>

              {error && <div className="small" style={{ color: 'var(--bad)', marginBottom: 10 }}>{error}</div>}

              <button type="submit" className="btn primary" disabled={isPending}>
                {I.check}{isPending ? 'Creating...' : 'Create asset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
