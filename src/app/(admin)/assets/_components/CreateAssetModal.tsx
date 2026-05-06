'use client';

import { useState, useTransition, useRef, KeyboardEvent } from 'react';
import { Car, Building2, Laptop, Cog, Package, X, Plus, Check, Hash } from 'lucide-react';
import { createAsset } from '../actions';
import type { AssetType } from '@/lib/db/types';

type ManagerOption = { id: string; name: string; role: string };

const ASSET_TYPES: {
  value: AssetType;
  label: string;
  icon: React.ReactNode;
  color: string;
  fields: { key: string; label: string; placeholder: string; textarea?: boolean }[];
}[] = [
  {
    value: 'car',
    label: 'Car',
    icon: <Car size={20} strokeWidth={1.75} />,
    color: '#6366f1',
    fields: [
      { key: 'carNumber', label: 'License Plate', placeholder: 'e.g. GR-1234-20' },
      { key: 'driverName', label: 'Driver Name', placeholder: 'e.g. Kwame Asante' },
      { key: 'notes', label: 'Notes', placeholder: 'Any additional info about this vehicle…', textarea: true },
    ],
  },
  {
    value: 'building',
    label: 'Building',
    icon: <Building2 size={20} strokeWidth={1.75} />,
    color: '#0ea5e9',
    fields: [
      { key: 'address', label: 'Address', placeholder: 'e.g. 12 Ring Road, Accra' },
      { key: 'floorUnit', label: 'Floor / Unit', placeholder: 'e.g. Floor 3, Unit 302' },
      { key: 'notes', label: 'Notes', placeholder: 'Any additional info about this building…', textarea: true },
    ],
  },
  {
    value: 'device',
    label: 'Device',
    icon: <Laptop size={20} strokeWidth={1.75} />,
    color: '#8b5cf6',
    fields: [
      { key: 'serialNumber', label: 'Serial Number', placeholder: 'e.g. SN-A3F9201' },
      { key: 'model', label: 'Model', placeholder: 'e.g. Dell XPS 15' },
      { key: 'notes', label: 'Notes', placeholder: 'Any additional info about this device…', textarea: true },
    ],
  },
  {
    value: 'machine',
    label: 'Machine',
    icon: <Cog size={20} strokeWidth={1.75} />,
    color: '#f59e0b',
    fields: [
      { key: 'serialNumber', label: 'Serial Number', placeholder: 'e.g. MCH-00423' },
      { key: 'operator', label: 'Operator', placeholder: 'e.g. Ama Boateng' },
      { key: 'notes', label: 'Notes', placeholder: 'Any additional info about this machine…', textarea: true },
    ],
  },
  {
    value: 'other',
    label: 'Other',
    icon: <Package size={20} strokeWidth={1.75} />,
    color: '#64748b',
    fields: [
      { key: 'description', label: 'Description', placeholder: 'Describe this asset in detail…', textarea: true },
    ],
  },
];

export function CreateAssetModal({ managers }: { managers: ManagerOption[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [assetType, setAssetType] = useState<AssetType>('car');
  const [details, setDetails] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const tagRef = useRef<HTMLInputElement>(null);

  const typeConfig = ASSET_TYPES.find(t => t.value === assetType)!;

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    setError(null);
    setAssetType('car');
    setDetails({});
    setTags([]);
    setTagInput('');
  }

  function addTag(raw: string) {
    const val = raw.trim().replace(/,+$/, '').trim();
    if (val && !tags.includes(val)) setTags(prev => [...prev, val]);
    setTagInput('');
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(prev => prev.slice(0, -1));
    }
  }

  function removeTag(t: string) {
    setTags(prev => prev.filter(x => x !== t));
  }

  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <Plus size={14} strokeWidth={2} className="ic" />
        New asset
      </button>

      {open && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div className="modal-panel glass asset-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${typeConfig.color}22, ${typeConfig.color}44)`,
                border: `1px solid ${typeConfig.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: typeConfig.color, flexShrink: 0, transition: 'all 200ms',
              }}>
                {typeConfig.icon}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em' }}>New asset</h3>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>Fill in the details below</div>
              </div>
              <button
                className="btn ghost"
                style={{ marginLeft: 'auto', padding: '5px 8px' }}
                onClick={handleClose}
                disabled={isPending}
              >
                <X size={15} strokeWidth={2} className="ic" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                const form = e.currentTarget;
                const formData = new FormData(form);
                formData.set('type', assetType);
                formData.set('details', JSON.stringify(details));
                formData.set('tags', JSON.stringify(tags));
                startTransition(async () => {
                  const res = await createAsset(formData);
                  if (!res?.ok) {
                    setError(res?.error ?? 'Could not create asset.');
                    return;
                  }
                  handleClose();
                });
              }}
            >
              {/* Asset type selector */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 8 }}>Asset type</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {ASSET_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { setAssetType(t.value); setDetails({}); }}
                      style={{
                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 6, padding: '10px 4px', borderRadius: 10, border: '1px solid',
                        borderColor: assetType === t.value ? t.color : 'var(--line-strong)',
                        background: assetType === t.value ? `${t.color}10` : 'rgba(255,255,255,0.6)',
                        color: assetType === t.value ? t.color : 'var(--ink-2)',
                        cursor: 'pointer', transition: 'all 150ms', fontFamily: 'inherit',
                        boxShadow: assetType === t.value ? `0 0 0 3px ${t.color}18` : 'none',
                      }}
                    >
                      {t.icon}
                      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '-0.01em' }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name + Tag row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 14 }}>
                <div className="field">
                  <label>Name <span style={{ color: 'var(--bad)' }}>*</span></label>
                  <input name="name" placeholder={
                    assetType === 'car' ? 'e.g. Toyota Hilux Fleet 04' :
                    assetType === 'building' ? 'e.g. Head Office Annex' :
                    assetType === 'device' ? 'e.g. MacBook Pro — Design Team' :
                    assetType === 'machine' ? 'e.g. Excavator Unit 7' :
                    'e.g. Generator Set A'
                  } required />
                </div>
                <div className="field" style={{ minWidth: 110 }}>
                  <label>ID / Tag</label>
                  <input name="tag" placeholder="e.g. FL-042" />
                </div>
              </div>

              {/* Type-specific detail fields */}
              <div style={{
                background: `${typeConfig.color}08`,
                border: `1px solid ${typeConfig.color}20`,
                borderRadius: 10, padding: '14px 14px 6px',
                marginBottom: 14,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: typeConfig.color, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {typeConfig.icon}
                  {typeConfig.label} details
                </div>
                {typeConfig.fields.map(f => (
                  <div key={f.key} className="field" style={{ marginBottom: 10 }}>
                    <label>{f.label}</label>
                    {f.textarea ? (
                      <textarea
                        rows={2}
                        placeholder={f.placeholder}
                        value={details[f.key] ?? ''}
                        onChange={e => setDetails(prev => ({ ...prev, [f.key]: e.target.value }))}
                        style={{
                          padding: '9px 12px', borderRadius: 9,
                          border: '1px solid var(--line-strong)',
                          background: 'rgba(255,255,255,0.85)',
                          fontSize: 13, fontFamily: 'inherit', color: 'var(--ink-0)',
                          outline: 'none', resize: 'none', lineHeight: 1.5,
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        value={details[f.key] ?? ''}
                        onChange={e => setDetails(prev => ({ ...prev, [f.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="field" style={{ marginBottom: 14 }}>
                <label>Tags</label>
                <div
                  style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6,
                    padding: '7px 10px', borderRadius: 9,
                    border: '1px solid var(--line-strong)',
                    background: 'rgba(255,255,255,0.85)',
                    cursor: 'text', minHeight: 40,
                  }}
                  onClick={() => tagRef.current?.focus()}
                >
                  {tags.map(t => (
                    <span key={t} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px 2px 9px', borderRadius: 999,
                      background: 'var(--brand-soft)', color: 'var(--brand)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      fontSize: 11.5, fontWeight: 500, flexShrink: 0,
                    }}>
                      {t}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeTag(t); }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: 0, display: 'flex', alignItems: 'center',
                          color: 'var(--brand)', opacity: 0.6, lineHeight: 1,
                        }}
                      >
                        <X size={11} strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagRef}
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                    placeholder={tags.length ? '' : 'Type and press Enter to add tags…'}
                    style={{
                      flex: 1, minWidth: 120, border: 'none', outline: 'none',
                      background: 'transparent', fontSize: 13, fontFamily: 'inherit',
                      color: 'var(--ink-0)', padding: '1px 2px',
                    }}
                  />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Press <kbd style={{ background: 'rgba(15,23,42,0.06)', padding: '1px 5px', borderRadius: 4, fontFamily: 'ui-monospace, monospace', fontSize: 10.5 }}>Enter</kbd> or <kbd style={{ background: 'rgba(15,23,42,0.06)', padding: '1px 5px', borderRadius: 4, fontFamily: 'ui-monospace, monospace', fontSize: 10.5 }}>,</kbd> to add a tag
                </div>
              </div>

              {/* Managers */}
              <div className="field" style={{ marginBottom: 14 }}>
                <label>
                  Assigned managers
                  <span style={{ color: 'var(--ink-3)', fontWeight: 400, marginLeft: 4 }}>(optional)</span>
                </label>
                <div className="manager-list">
                  {managers.length === 0 ? (
                    <div style={{ padding: '10px 8px', fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center' }}>
                      No managers in your org yet — invite some from the Users page.
                    </div>
                  ) : (
                    managers.map((m) => (
                      <label key={m.id} className="manager-item">
                        <input type="checkbox" name="managers" value={m.name} style={{ accentColor: 'var(--brand)' }} />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--ink-3)', background: 'rgba(15,23,42,0.05)', padding: '1px 7px', borderRadius: 999 }}>Manager</span>
                      </label>
                    ))
                  )}
                </div>
                <div className="hint">Admins and owners can manage all assets by default. Only assign managers who need explicit access to this asset.</div>
              </div>

              {/* Slack channel */}
              <div className="field" style={{ marginBottom: 18 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Hash size={12} strokeWidth={2} style={{ color: 'var(--ink-3)' }} />
                  Slack channel <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input name="slack" placeholder="fleet-maintenance" style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5 }} />
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', borderRadius: 9, marginBottom: 14,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  fontSize: 12.5, color: 'var(--bad)',
                }}>
                  <X size={13} strokeWidth={2.5} />
                  {error}
                </div>
              )}

              <button type="submit" className="btn primary" disabled={isPending} style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }}>
                <Check size={14} strokeWidth={2.5} className="ic" />
                {isPending ? 'Creating…' : 'Create asset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
