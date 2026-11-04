import { useState } from 'react';
import { cn } from '@/lib/cn';
import styles from './Waffle.module.css';

export interface WaffleSlice {
  id: string;
  share: number;
  color: string;
}

/** Largest-remainder allocation so cells always sum to exactly `total`. */
export function allocateCells(shares: readonly number[], total: number): number[] {
  const sum = shares.reduce((a, b) => a + b, 0);
  if (!sum) return shares.map(() => 0);
  const raw = shares.map((s) => (s / sum) * total);
  const out = raw.map(Math.floor);
  let rest = total - out.reduce((a, b) => a + b, 0);
  raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => {
      if (rest > 0) {
        out[i]! += 1;
        rest -= 1;
      }
    });
  return out;
}

interface WaffleProps {
  slices: WaffleSlice[];
  highlight?: string | null;
  onHighlight?: (id: string | null) => void;
  cols?: number;
  rows?: number;
  label: string;
}

/** 10×10 dot grid — each dot is one percent. */
export function Waffle({ slices, highlight: controlled, onHighlight, cols = 20, rows = 5, label }: WaffleProps) {
  const [own, setOwn] = useState<string | null>(null);
  const highlight = controlled !== undefined ? controlled : own;
  const set = onHighlight ?? setOwn;
  const total = cols * rows;
  const counts = allocateCells(
    slices.map((s) => s.share),
    total,
  );
  const cells: Array<WaffleSlice | null> = [];
  slices.forEach((s, i) => {
    for (let k = 0; k < (counts[i] ?? 0); k++) cells.push(s);
  });
  while (cells.length < total) cells.push(null);

  return (
    <div
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      role="img"
      aria-label={label}
      onMouseLeave={() => set(null)}
    >
      {cells.map((s, i) => (
        <span
          key={i}
          className={cn(styles.cell, !s && styles.empty, highlight && s?.id !== highlight && styles.dim)}
          style={s ? { background: s.color } : undefined}
          onMouseEnter={() => s && set(s.id)}
        />
      ))}
    </div>
  );
}
