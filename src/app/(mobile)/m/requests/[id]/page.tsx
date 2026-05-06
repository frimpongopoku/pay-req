import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { MPill } from '@/components/ui/Pill';
import { MI } from '@/components/ui/icons';
import { ReceiptUpload } from './_components/ReceiptUpload';

const LIFECYCLE_STAGES = ['SUBMITTED','UNDER_REVIEW','APPROVED','PAID','RECEIPTS_SUBMITTED','COMPLETED'] as const;
const STAGE_NAMES = ['Submitted','Under review','Approved','Paid','Receipts in','Completed'];

export default async function MobileRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const user = await getSessionUser();
  const [request, assets] = await Promise.all([
    db.getRequest(id),
    db.listAssets(user?.orgId ?? ''),
  ]);

  if (!request) notFound();

  const asset = assets.find(a => a.id === request.asset);
  const stageIdx = LIFECYCLE_STAGES.indexOf(request.status as typeof LIFECYCLE_STAGES[number]);

  return (
    <>
      <div className="m-header" style={{ paddingBottom: 4 }}>
        <Link href="/m/requests" className="m-icon-btn" style={{ background: 'transparent', border: 'none', textDecoration: 'none' }}>
          {MI.back}
        </Link>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 500, color: 'var(--m-ink-2)' }}>Request</div>
        <div className="m-icon-btn" style={{ background: 'transparent', border: 'none' }}>{MI.more}</div>
      </div>

      <div className="m-detail-head">
        <div className="id">{request.id} · submitted {request.submitted}</div>
        <div className="ttl">{request.title}</div>
        <div className="chips">
          <MPill status={request.status} />
          {asset && <span className="chip">{asset.name.split(' — ')[0]}</span>}
          {request.priority === 'high' && (
            <span className="chip" style={{ color: 'var(--m-bad)', background: 'rgba(220,38,38,0.08)' }}>High priority</span>
          )}
        </div>
      </div>

      <div className="m-card">
        <div className="kv">
          <div className="k">Amount</div>
          <div className="v">${request.amount.toLocaleString()} <span style={{ color: 'var(--m-ink-3)', fontWeight: 400 }}>{request.currency}</span></div>
          <div className="k">Payee</div>
          <div className="v">{request.payee}</div>
          <div className="k">Need by</div>
          <div className="v">{request.deadline}</div>
          {asset && (
            <>
              <div className="k">Reviewer</div>
              <div className="v">
                {asset.managers.length ? asset.managers.join(', ') : 'All admins'}
              </div>
            </>
          )}
        </div>
      </div>

      {request.purpose && (
        <div className="m-card">
          <h4>Purpose</h4>
          <div style={{ fontSize: 13.5, color: 'var(--m-ink-1)', lineHeight: 1.55 }}>{request.purpose}</div>
        </div>
      )}

      <div className="m-sec" style={{ paddingTop: 0 }}><h3>Lifecycle</h3></div>
      <div className="m-vsteps">
        {LIFECYCLE_STAGES.map((s, i) => {
          const isDone = i < stageIdx;
          const isCur  = i === stageIdx;
          const cls    = isDone ? 'done' : isCur ? 'cur' : '';
          return (
            <div key={s} className={`m-vstep ${cls}`}>
              <div className="col-mark">
                <div className="mark" />
                <div className="line" />
              </div>
              <div className="body">
                <div className="name" style={!isDone && !isCur ? { color: 'var(--m-ink-3)' } : undefined}>
                  {STAGE_NAMES[i]}
                </div>
                {isCur && <div className="ts">{request.submitted}</div>}
                {isDone && <div className="ts">✓</div>}
                {i === 0 && isDone && (
                  <div className="note">
                    {request.attachments.length > 0
                      ? `Submitted with ${request.attachments.length} attachment${request.attachments.length !== 1 ? 's' : ''}.`
                      : 'Submitted with no attachments.'}
                    {asset?.managers.length
                      ? ` Assigned to ${asset.managers.join(', ')}.`
                      : ' Reviewable by all admins.'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {request.attachments.length > 0 && (
        <div className="m-card">
          <h4>Attachments</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {request.attachments.map((url, i) => {
              const name = url.split('/').pop() ?? url;
              const isImage = /\.(png|jpe?g|gif|webp|heic)$/i.test(name);
              return (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: 64 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', background: '#f1f5f9', border: '1px solid var(--m-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isImage
                      ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10, fontWeight: 600, color: 'var(--m-ink-2)' }}>{name.split('.').pop()?.toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--m-ink-2)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{name}</div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {request.status === 'PAID' && (
        <ReceiptUpload requestId={request.id} />
      )}

      <div style={{ height: 110 }} />
    </>
  );
}
