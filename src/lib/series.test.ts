import type { Category, Transaction } from '@/domain/types';
import { balanceSeries, categoryChanges, dailyTotals, monthPace, resample } from './finance';

let id = 0;
const tx = (p: Partial<Transaction>): Transaction => ({
  id: String(++id),
  userId: 'u',
  type: 'expense',
  amount: 10,
  categoryId: 'food',
  date: '2026-11-01',
  comment: '',
  createdAt: id,
  ...p,
});

describe('chart series', () => {
  it('runs a balance from the opening amount and stops at today', () => {
    const ts = [
      tx({ type: 'income', amount: 1000, date: '2026-10-20' }),
      tx({ amount: 100, date: '2026-11-02' }),
      tx({ type: 'income', amount: 50, date: '2026-11-03' }),
    ];
    const s = balanceSeries(ts, '2026-11-01', '2026-11-30', '2026-11-04');
    expect(s.opening).toBe(1000);
    expect(s.granularity).toBe('day');
    expect(s.points).toHaveLength(4);
    expect(s.points.map((p) => p.balance)).toEqual([1000, 900, 950, 950]);
    expect(s.points[1]!.net).toBe(-100);
  });

  it('sums daily totals per type', () => {
    const m = dailyTotals([tx({ amount: 5 }), tx({ amount: 7 }), tx({ type: 'income', amount: 99 }), tx({ date: '2026-11-02' })]);
    expect(m.get('2026-11-01')).toBe(12);
    expect(m.get('2026-11-02')).toBe(10);
  });

  it('compares the month pace with the previous month and projects month end', () => {
    const ts = [
      tx({ amount: 300, date: '2026-10-02' }),
      tx({ amount: 700, date: '2026-10-25' }),
      tx({ amount: 100, date: '2026-11-01' }),
      tx({ amount: 50, date: '2026-11-03' }),
      tx({ amount: 999, date: '2026-11-20' }), // planned, after "now"
    ];
    const p = monthPace(ts, new Date(2026, 10, 1), new Date(2026, 10, 5));
    expect(p.days).toBe(30);
    expect(p.elapsed).toBe(5);
    expect(p.current).toEqual([100, 100, 150, 150, 150]);
    expect(p.spent).toBe(150);
    expect(p.previousToDate).toBe(300);
    expect(p.previousTotal).toBe(1000);
    // 150 so far + last month's spending after the 5th (700), scaled 25/26 days.
    expect(p.forecast).toBe(Math.round(150 + 700 * (25 / 26)));
  });

  it('extrapolates the daily average when there is no previous month', () => {
    const p = monthPace([tx({ amount: 100, date: '2026-11-02' })], new Date(2026, 10, 1), new Date(2026, 10, 10));
    expect(p.forecast).toBe(300);
  });

  it('has no forecast for a finished month', () => {
    const p = monthPace([tx({ date: '2026-09-10' })], new Date(2026, 8, 1), new Date(2026, 10, 5));
    expect(p.elapsed).toBe(30);
    expect(p.forecast).toBeNull();
    expect(p.spent).toBe(10);
  });

  it('ranks category changes by absolute swing', () => {
    const cats = new Map<string, Category>([['food', { id: 'food', userId: 'u', name: 'Еда', icon: 'food', color: '#000' }]]);
    const r = categoryChanges(
      [tx({ amount: 50 }), tx({ categoryId: 'fun', amount: 400 })],
      [tx({ amount: 200 }), tx({ categoryId: 'fun', amount: 400 }), tx({ categoryId: 'taxi', amount: 30 })],
      cats,
    );
    expect(r.map((c) => [c.categoryId, c.diff])).toEqual([
      ['food', -150],
      ['taxi', -30],
    ]);
    expect(r[0]!.category?.name).toBe('Еда');
  });

  it('resamples long series', () => {
    expect(resample([1, 2, 3, 4, 5], 10)).toEqual([1, 2, 3, 4, 5]);
    expect(resample([1, 2, 3, 4, 5], 2)).toEqual([6, 9]);
    expect(resample([1, 2, 3, 4, 5], 2, 'last')).toEqual([3, 5]);
  });
});
