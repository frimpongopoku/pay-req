'use client';
import { useTransition } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { addMobileAttachments } from '../actions';

export function ReceiptUpload({ requestId }: { requestId: string }) {
  const [, startTransition] = useTransition();

  function handleUploaded(urls: string[]) {
    startTransition(() => addMobileAttachments(requestId, urls));
  }

  return (
    <div className="m-card">
      <h4>Upload receipts</h4>
      <div className="small muted" style={{ marginBottom: 12 }}>
        Add photos or PDFs of your receipts to move this request forward.
      </div>
      <FileUpload variant="mobile" onUploadComplete={handleUploaded} />
    </div>
  );
}
