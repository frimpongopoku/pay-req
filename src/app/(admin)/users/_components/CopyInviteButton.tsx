'use client';
import { useState } from 'react';

interface Props {
  email: string;
  role: string;
  orgName: string;
}

export function CopyInviteButton({ email, role, orgName }: Props) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const article = ['Admin', 'Employee'].includes(role) ? 'an' : 'a';
    const url = window.location.origin;
    const msg = `Hi! You've been invited to join ${orgName || 'PayReq'} as ${article} ${role}.\n\nSign in with your Google account (${email}) at:\n${url}/auth/signin\n\nYour access will be granted automatically.`;
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      className="btn ghost"
      onClick={copy}
      title="Copy invite message"
      style={{ fontSize: 12, padding: '4px 10px', color: copied ? 'var(--good)' : undefined }}
    >
      {copied ? '✓ Copied' : 'Copy message'}
    </button>
  );
}
