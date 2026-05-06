'use client';
import { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';

export interface FileUploadHandle {
  uploadAll: () => Promise<string[]>;
}

interface LocalFile {
  file: File;
  preview: string;
}

interface RemoteFile {
  name: string;
  url: string;
}

interface Props {
  inputName?: string;
  existing?: string[];
  variant?: 'default' | 'mobile';
  onUploadComplete?: (urls: string[]) => void;
  /** When true, files are only previewed locally — call uploadAll() on the ref to upload at submit time */
  deferred?: boolean;
}

export const FileUpload = forwardRef<FileUploadHandle, Props>(
  function FileUpload({ inputName = 'attachments', existing = [], variant = 'default', onUploadComplete, deferred = false }, ref) {
    const [remoteFiles, setRemoteFiles] = useState<RemoteFile[]>(
      existing.map(url => ({ name: url.split('/').pop() ?? url, url }))
    );
    const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      return () => { localFiles.forEach(f => URL.revokeObjectURL(f.preview)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      async uploadAll() {
        if (!localFiles.length) return [];
        setUploading(true);
        setError('');
        const urls: string[] = [];
        for (const { file } of localFiles) {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch('/api/attachments/upload', { method: 'POST', body: fd });
          const json = await res.json();
          if (json.error) { setError(json.error); break; }
          urls.push(json.url);
        }
        setUploading(false);
        return urls;
      },
    }));

    function handlePick(picked: FileList | null) {
      if (!picked || !picked.length) return;
      if (deferred) {
        setLocalFiles(prev => [
          ...prev,
          ...Array.from(picked).map(file => ({ file, preview: URL.createObjectURL(file) })),
        ]);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      uploadNow(picked);
    }

    async function uploadNow(picked: FileList) {
      setUploading(true);
      setError('');
      const results: RemoteFile[] = [];
      for (const file of Array.from(picked)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/attachments/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (json.error) { setError(json.error); break; }
        results.push({ name: file.name, url: json.url });
      }
      setRemoteFiles(prev => [...prev, ...results]);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
      if (results.length && onUploadComplete) onUploadComplete(results.map(f => f.url));
    }

    function removeRemote(url: string) {
      setRemoteFiles(prev => prev.filter(f => f.url !== url));
    }

    function removeLocal(preview: string) {
      URL.revokeObjectURL(preview);
      setLocalFiles(prev => prev.filter(f => f.preview !== preview));
    }

    const totalCount = remoteFiles.length + localFiles.length;

    if (variant === 'mobile') {
      return (
        <div>
          {/* Hidden inputs for already-uploaded files (non-deferred remote files) */}
          {!deferred && remoteFiles.map(f => (
            <input key={f.url} type="hidden" name={inputName} value={f.url} />
          ))}

          {totalCount > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {remoteFiles.map(f => (
                <MobileThumb key={f.url} src={f.url} name={f.name} isLocal={false}
                  onRemove={() => removeRemote(f.url)} />
              ))}
              {localFiles.map(f => (
                <MobileThumb key={f.preview} src={f.preview} name={f.file.name} isLocal
                  onRemove={() => removeLocal(f.preview)} />
              ))}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            style={{ display: 'none' }}
            onChange={e => handlePick(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              borderRadius: 12, border: '1.5px dashed var(--m-line)',
              background: 'var(--m-glass-2)', width: '100%', fontSize: 13.5,
              color: 'var(--m-ink-2)', cursor: 'pointer', justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          >
            {uploading ? 'Uploading…' : `+ Add photos or PDF${totalCount ? ` (${totalCount} added)` : ''}`}
          </button>
          {deferred && totalCount > 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--m-ink-3)', marginTop: 6, textAlign: 'center' }}>
              Files will upload when you submit the form
            </div>
          )}
          {error && <div style={{ fontSize: 12, color: 'var(--m-bad)', marginTop: 6 }}>{error}</div>}
        </div>
      );
    }

    return (
      <div>
        {!deferred && remoteFiles.map(f => (
          <input key={f.url} type="hidden" name={inputName} value={f.url} />
        ))}
        <div className="attach">
          {remoteFiles.map(f => (
            <div key={f.url} className="a" style={{ position: 'relative' }}>
              <DesktopThumb src={f.url} name={f.name} />
              <div className="name" title={f.name}>{f.name}</div>
              <RemoveBtn onClick={() => removeRemote(f.url)} />
            </div>
          ))}
          {localFiles.map(f => (
            <div key={f.preview} className="a" style={{ position: 'relative' }}>
              <DesktopThumb src={f.preview} name={f.file.name} isLocal />
              <div className="name" title={f.file.name}>{f.file.name}</div>
              <RemoveBtn onClick={() => removeLocal(f.preview)} />
            </div>
          ))}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            style={{ display: 'none' }}
            onChange={e => handlePick(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="a"
            style={{ opacity: uploading ? 0.6 : 1, cursor: 'pointer', border: 'none', background: 'transparent' }}
          >
            <div className="thumb" style={{ borderStyle: 'dashed', background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploading ? '…' : '+'}
            </div>
            <div className="name">{uploading ? 'Uploading…' : 'Add file'}</div>
          </button>
        </div>
        {deferred && totalCount > 0 && (
          <div className="hint" style={{ marginTop: 6 }}>
            {totalCount} file{totalCount !== 1 ? 's' : ''} queued — will upload on submit
          </div>
        )}
        {error && <div className="small" style={{ color: 'var(--bad)', marginTop: 6 }}>{error}</div>}
      </div>
    );
  }
);

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(220,38,38,0.8)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      ✕
    </button>
  );
}

function DesktopThumb({ src, name, isLocal }: { src: string; name: string; isLocal?: boolean }) {
  const isImage = isLocal ? src.startsWith('blob:') : /\.(png|jpe?g|gif|webp|heic)$/i.test(name);
  const inner = isImage
    ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)' }}>{name.split('.').pop()?.toUpperCase()}</span>;
  if (isLocal) {
    return (
      <div className="thumb" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        {inner}
      </div>
    );
  }
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div className="thumb" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        {inner}
      </div>
    </a>
  );
}

function MobileThumb({ src, name, isLocal, onRemove }: { src: string; name: string; isLocal: boolean; onRemove: () => void }) {
  const isImage = isLocal ? true : /\.(png|jpe?g|gif|webp|heic)$/i.test(name);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', background: '#f1f5f9', border: `1px solid var(--m-line)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isImage
          ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--m-ink-2)' }}>{name.split('.').pop()?.toUpperCase()}</span>
        }
        {isLocal && (
          <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(28,25,23,0.5)', borderRadius: 4, padding: '1px 4px', fontSize: 8, color: 'white' }}>
            preview
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--m-bad)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
      >
        ✕
      </button>
    </div>
  );
}
