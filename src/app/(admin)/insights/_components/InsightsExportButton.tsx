'use client';
import { I } from '@/components/ui/icons';
import type { Request, Asset } from '@/lib/db';

interface Props {
  requests: Request[];
  assets: Asset[];
  currency: string;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function InsightsExportButton({ requests, assets, currency }: Props) {
  function handleExport() {
    const assetMap = Object.fromEntries(assets.map(a => [a.id, a.name.split(' — ')[0]]));
    const headers = ['ID', 'Title', 'Asset', 'Requester', 'Status', 'Amount', 'Currency', 'Priority', 'Submitted', 'Deadline'];
    const rows = requests.map(r => [
      r.id, r.title, assetMap[r.asset] ?? r.asset, r.requester,
      r.status, r.amount, r.currency, r.priority,
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : r.submitted,
      r.deadline,
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const date = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `payreq-insights-${date}.csv`);
  }

  return (
    <button className="btn ghost" onClick={handleExport}>
      {I.download}Export CSV
    </button>
  );
}
