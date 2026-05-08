'use client';

export function VersionStamp({ className }: { className?: string }) {
  return (
    <span className={className}>
      PayReq v{process.env.NEXT_PUBLIC_APP_VERSION ?? '—'}
    </span>
  );
}
