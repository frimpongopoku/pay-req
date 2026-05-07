'use client';
import { useState, useEffect, useRef } from 'react';
import { I } from './icons';

export interface RowMenuItem {
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function RowMenu({ items }: { items: RowMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn ghost"
        style={{ padding: 4 }}
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
      >
        {I.more}
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 4,
          minWidth: 168, background: 'white',
          border: '1px solid var(--line-strong)',
          borderRadius: 10,
          boxShadow: '0 4px 24px -4px rgba(15,23,42,0.14), 0 1px 4px rgba(15,23,42,0.06)',
          overflow: 'hidden', zIndex: 200,
        }}>
          {items.map((item, i) => (
            <button
              key={i}
              disabled={item.disabled}
              className={'row-menu-item' + (item.danger ? ' danger' : '')}
              onClick={e => { e.stopPropagation(); setOpen(false); item.onClick(); }}
            >
              {item.icon && <span style={{ opacity: 0.7, display: 'flex' }}>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
