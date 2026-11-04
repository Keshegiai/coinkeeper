import type { Category, Transaction } from '@/domain/types';

const escape = (v: string | number) => {
  const s = String(v);
  return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function transactionsToCsv(ts: readonly Transaction[], categories: ReadonlyMap<string, Category>): string {
  const header = ['date', 'type', 'amount', 'category', 'comment'];
  const rows = ts.map((t) => [t.date, t.type, t.amount.toFixed(2), categories.get(t.categoryId)?.name ?? '', t.comment]);
  // BOM so Excel opens UTF-8 Cyrillic correctly.
  return '﻿' + [header, ...rows].map((r) => r.map(escape).join(',')).join('\r\n');
}

export function downloadFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
