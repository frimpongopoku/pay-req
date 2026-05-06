'use client';
import { useId } from 'react';

interface SparkProps {
  data: number[];
  w?: number;
  h?: number;
  color?: string;
  fill?: boolean;
}

export function Spark({ data, w = 110, h = 36, color = 'var(--brand)', fill = true }: SparkProps) {
  const id = useId();
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 4) - 2,
  ]);
  const path = 'M ' + pts.map(p => p.join(',')).join(' L ');
  const area = path + ` L ${w},${h} L 0,${h} Z`;
  return (
    <svg width={w} height={h}>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${id})`} />
        </>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
