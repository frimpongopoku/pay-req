'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase-client';

type Intent = 'admin' | 'employee' | null;

export default function SignInPage() {
  const router = useRouter();
  const [intent, setIntent] = useState<Intent>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleReady = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );

  async function handleSignIn() {
    if (!googleReady || loading || !intent) return;
    setLoading(true);
    setError('');
    try {
      const cred = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      const idToken = await cred.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) { setError('Sign-in failed. Please try again.'); return; }

      const { role, orgId } = await res.json();

      if (intent === 'admin') {
        router.push(orgId ? '/dashboard' : '/onboarding');
      } else {
        router.push(orgId ? '/m' : '/m/pending');
      }
      router.refresh();
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="app-bg" />
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card glass-strong">
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div className="brand-mark" style={{ margin: '0 auto 12px' }} />
            <h1 className="h1" style={{ marginBottom: 6 }}>Welcome to PayReq</h1>
            <div className="muted small">Choose how you're signing in.</div>
          </div>

          {/* Role selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setIntent('admin')}
              className={'auth-role-btn' + (intent === 'admin' ? ' active' : '')}
              style={{
                border: `2px solid ${intent === 'admin' ? 'var(--brand)' : undefined}`,
                background: intent === 'admin' ? 'var(--brand-soft)' : undefined,
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>🏢</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink-0)' }}>Admin / Manager</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.4 }}>
                Manage requests, assets and approvals
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIntent('employee')}
              className={'auth-role-btn' + (intent === 'employee' ? ' active' : '')}
              style={{
                border: `2px solid ${intent === 'employee' ? 'var(--brand)' : undefined}`,
                background: intent === 'employee' ? 'var(--brand-soft)' : undefined,
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>👷</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink-0)' }}>Employee</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.4 }}>
                Submit and track your payment requests
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSignIn}
            className="btn primary"
            style={{ width: '100%', justifyContent: 'center', opacity: intent ? 1 : 0.45 }}
            disabled={!googleReady || loading || !intent}
          >
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {!intent && (
            <div className="small muted" style={{ marginTop: 10, textAlign: 'center' }}>
              Select your role above to continue.
            </div>
          )}
          {error && (
            <div className="small" style={{ marginTop: 10, textAlign: 'center', color: 'var(--bad)' }}>
              {error}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(15,23,42,0.35)', letterSpacing: '0.04em' }}>
          PayReq v{process.env.NEXT_PUBLIC_APP_VERSION ?? '—'}
        </div>
        </div>
      </div>
    </>
  );
}
