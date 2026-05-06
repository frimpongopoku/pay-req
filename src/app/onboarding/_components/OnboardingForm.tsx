'use client';
import { useRef, useState, useTransition } from 'react';
import { createOrganisation } from '../actions';

export function OnboardingForm({ userName }: { userName: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setError('');
    startTransition(async () => {
      try {
        await createOrganisation(new FormData(formRef.current!));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  return (
    <>
      <div className="app-bg" />
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          {/* Step header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="brand-mark" style={{ margin: '0 auto 14px' }} />
            <div className="muted small" style={{ marginBottom: 6 }}>Welcome, {userName.split(' ')[0]} 👋</div>
            <h1 className="h1" style={{ marginBottom: 8 }}>Set up your organisation</h1>
            <div className="muted small">You'll be the admin. You can invite your team afterwards.</div>
          </div>

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="card glass-strong" style={{ marginBottom: 14 }}>
              <div className="field" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13 }}>
                  Organisation name <span style={{ color: 'var(--bad)' }}>*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Northbound Freight"
                  autoFocus
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
                <div className="muted small" style={{ marginTop: 6 }}>
                  This is the name your team will see across PayReq.
                </div>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', color: 'var(--bad)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={isPending}
            >
              {isPending ? 'Creating…' : 'Create organisation →'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
