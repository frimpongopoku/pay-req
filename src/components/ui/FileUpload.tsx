'use client';
import { useRef, useState } from 'react';

interface UploadedFile {
  name: string;
  url: string;
}

interface Props {
  /** Name attribute for the hidden inputs — server action reads `formData.getAll(name)` */
  inputName?: string;
  /** Existing URLs to pre-populate (read-only when onUploadComplete is provided) */
  existing?: string[];
  /** Visual variant */
  variant?: 'default' | 'mobile';
  /** If provided, called after each upload batch instead of using hidden inputs */
  onUploadComplete?: (urls: string[]) => void;
}

export function FileUpload({ inputName = 'attachments', existing = [], variant = 'default', onUploadComplete }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>(
    existing.map(url => ({ name: url.split('/').pop() ?? url, url }))
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(picked: FileList | null) {
    if (!picked || picked.length === 0) return;
    setUploading(true);
    setError('');

    const results: UploadedFile[] = [];
    for (const file of Array.from(picked)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/attachments/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.error) { setError(json.error); break; }
      results.push({ name: file.name, url: json.url });
    }

    setFiles(prev => [...prev, ...results]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    if (results.length && onUploadComplete) onUploadComplete(results.map(f => f.url));
  }

  function remove(url: string) {
    setFiles(prev => prev.filter(f => f.url !== url));
  }

  if (variant === 'mobile') {
    return (
      <div>
        {!onUploadComplete && files.map(f => (
          <input key={f.url} type="hidden" name={inputName} value={f.url} />
        ))}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: files.length ? 10 : 0 }}>
          {files.map(f => (
            <div key={f.url} style={{ position: 'relative' }}>
              <MobileThumb url={f.url} name={f.name} />
              <button
                type="button"
                onClick={() => remove(f.url)}
                style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--m-bad)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple style={{ display: 'none' }} onChange={e => upload(e.target.files)} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, border: '1.5px dashed var(--m-line)', background: 'var(--m-glass-2)', width: '100%', fontSize: 13.5, color: 'var(--m-ink-2)', cursor: 'pointer', justifyContent: 'center' }}
        >
          {uploading ? 'Uploading…' : '+ Add photos or PDF'}
        </button>
        {error && <div style={{ fontSize: 12, color: 'var(--m-bad)', marginTop: 6 }}>{error}</div>}
      </div>
    );
  }

  return (
    <div>
      {!onUploadComplete && files.map(f => (
        <input key={f.url} type="hidden" name={inputName} value={f.url} />
      ))}
      <div className="attach">
        {files.map(f => (
          <div key={f.url} className="a" style={{ position: 'relative' }}>
            <Thumb url={f.url} name={f.name} />
            <div className="name" title={f.name}>{f.name}</div>
            <button
              type="button"
              onClick={() => remove(f.url)}
              style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(220,38,38,0.8)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          </div>
        ))}
        <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple style={{ display: 'none' }} onChange={e => upload(e.target.files)} />
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
      {error && <div className="small" style={{ color: 'var(--bad)', marginTop: 6 }}>{error}</div>}
    </div>
  );
}

function Thumb({ url, name }: { url: string; name: string }) {
  const isImage = /\.(png|jpe?g|gif|webp|heic)$/i.test(name);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      <div className="thumb" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        {isImage
          ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)' }}>{name.split('.').pop()?.toUpperCase()}</span>
        }
      </div>
    </a>
  );
}

function MobileThumb({ url, name }: { url: string; name: string }) {
  const isImage = /\.(png|jpe?g|gif|webp|heic)$/i.test(name);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', background: '#f1f5f9', border: '1px solid var(--m-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isImage
          ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--m-ink-2)' }}>{name.split('.').pop()?.toUpperCase()}</span>
        }
      </div>
    </a>
  );
}
