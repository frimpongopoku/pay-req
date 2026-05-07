'use client';
import { useState } from 'react';

interface MonthBucket {
  label: string;
  byAsset: Record<string, number>;
}

interface Props {
  months: MonthBucket[];
  assetNames: string[];   // top assets (short names)
  currency: string;
}

const PALETTE = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#0ea5e9', '#f97316', '#14b8a6', '#ec4899', '#84cc16',
];

export function AssetSpendCharts({ months, assetNames, currency }: Props) {
  const [mode, setMode] = useState<'bar' | 'line'>('bar');

  const W = 540, H = 200, PAD_L = 56, PAD_R = 16, PAD_T = 12, PAD_B = 32;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const maxSpend = Math.max(
    ...months.map(m => assetNames.reduce((s, a) => s + (m.byAsset[a] ?? 0), 0)),
    1,
  );

  const barW = chartW / months.length;

  function yPos(v: number) {
    return PAD_T + chartH - (v / maxSpend) * chartH;
  }

  function fmt(v: number) {
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return String(v);
  }

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {(['bar', 'line'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500,
              border: '1px solid var(--line)', cursor: 'pointer', fontFamily: 'inherit',
              background: mode === m ? 'var(--brand)' : 'transparent',
              color: mode === m ? '#fff' : 'var(--ink-2)',
              transition: 'all 100ms',
            }}
          >
            {m === 'bar' ? 'Bar chart' : 'Trend lines'}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        {assetNames.map((a, i) => (
          <span key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <span style={{ width: 10, height: mode === 'line' ? 3 : 10, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
            <span style={{ color: 'var(--ink-2)' }}>{a}</span>
          </span>
        ))}
      </div>

      {/* SVG chart */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Y-axis gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = PAD_T + chartH * (1 - f);
          return (
            <g key={f}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="rgba(15,23,42,0.06)" strokeWidth={1} />
              <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={10} fill="var(--ink-3)">
                {fmt(maxSpend * f)}
              </text>
            </g>
          );
        })}

        {mode === 'bar' ? (
          /* Grouped bar chart */
          months.map((m, mi) => {
            const groupX = PAD_L + mi * barW;
            const innerPad = barW * 0.12;
            const totalW = barW - innerPad * 2;
            const bw = totalW / assetNames.length;
            return (
              <g key={mi}>
                {assetNames.map((a, ai) => {
                  const v = m.byAsset[a] ?? 0;
                  const bh = (v / maxSpend) * chartH;
                  const x = groupX + innerPad + ai * bw;
                  const y = PAD_T + chartH - bh;
                  return v > 0 ? (
                    <rect key={a} x={x} y={y} width={bw - 1} height={bh}
                      fill={PALETTE[ai % PALETTE.length]}
                      rx={2} opacity={0.85}>
                      <title>{a}: {currency} {v.toLocaleString()}</title>
                    </rect>
                  ) : null;
                })}
                <text x={groupX + barW / 2} y={H - PAD_B + 14} textAnchor="middle" fontSize={10} fill="var(--ink-3)">
                  {m.label}
                </text>
              </g>
            );
          })
        ) : (
          /* Trend lines */
          assetNames.map((a, ai) => {
            const color = PALETTE[ai % PALETTE.length];
            const pts = months.map((m, mi) => {
              const x = PAD_L + mi * barW + barW / 2;
              const y = yPos(m.byAsset[a] ?? 0);
              return `${x},${y}`;
            });
            return (
              <g key={a}>
                <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
                {months.map((m, mi) => {
                  const v = m.byAsset[a] ?? 0;
                  const x = PAD_L + mi * barW + barW / 2;
                  const y = yPos(v);
                  return (
                    <circle key={mi} cx={x} cy={y} r={3.5} fill={color} opacity={0.9}>
                      <title>{a} · {m.label}: {currency} {v.toLocaleString()}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })
        )}

        {/* X-axis labels for line mode */}
        {mode === 'line' && months.map((m, mi) => (
          <text key={mi} x={PAD_L + mi * barW + barW / 2} y={H - PAD_B + 14} textAnchor="middle" fontSize={10} fill="var(--ink-3)">
            {m.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
