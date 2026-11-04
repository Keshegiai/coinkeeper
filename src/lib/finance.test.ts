import type { Category, Transaction } from '@/domain/types';
import { breakdownByCategory, budgetStatuses, cashFlowSeries, delta, groupByDay, sortTransactions, totals } from './finance';

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
const cat = (p: Partial<Category>): Category => ({ id: 'food', userId: 'u', name: 'Еда', icon: 'food', color: '#000', ...p });

describe('finance', () => {
  it('computes totals without float drift', () => {
    const t = totals([tx({ amount: 0.1 }), tx({ amount: 0.2 }), tx({ type: 'income', amount: 1 })]);
    expect(t).toEqual({ income: 1, expense: 0.3, net: 0.7, count: 3 });
  });

  it('computes deltas', () => {
    expect(delta(150, 100)).toBeCloseTo(0.5);
    expect(delta(0, 0)).toBe(0);
    expect(delta(10, 0)).toBeNull();
  });

  it('breaks down by category, largest first', () => {
    const cats = new Map([
      ['food', cat({})],
      ['bus', cat({ id: 'bus', name: 'Транспорт' })],
    ]);
    const s = breakdownByCategory([tx({ amount: 30 }), tx({ amount: 10, categoryId: 'bus' }), tx({ type: 'income', amount: 999 })], 'expense', cats);
    expect(s.map((x) => [x.categoryId, x.amount, x.share])).toEqual([
      ['food', 30, 0.75],
      ['bus', 10, 0.25],
    ]);
  });

  it('zero-fills daily series', () => {
    const { granularity, buckets } = cashFlowSeries([tx({ date: '2026-11-02', amount: 5 })], '2026-11-01', '2026-11-03');
    expect(granularity).toBe('day');
    expect(buckets.map((b) => [b.key, b.expense])).toEqual([
      ['2026-11-01', 0],
      ['2026-11-02', 5],
      ['2026-11-03', 0],
    ]);
  });

  it('switches to monthly buckets for long ranges', () => {
    const { granularity, buckets } = cashFlowSeries([tx({ date: '2026-03-15', type: 'income', amount: 7 })], '2026-01-01', '2026-12-31');
    expect(granularity).toBe('month');
    expect(buckets).toHaveLength(12);
    expect(buckets[2]).toMatchObject({ key: '2026-03', income: 7 });
  });

  it('computes budget status for the given month only', () => {
    const s = budgetStatuses(
      [tx({ amount: 80, date: '2026-11-03' }), tx({ amount: 500, date: '2026-10-30' })],
      [cat({ budget: 100 }), cat({ id: 'x', budget: null })],
      new Date(2026, 10, 15),
    );
    expect(s).toHaveLength(1);
    expect(s[0]).toMatchObject({ spent: 80, remaining: 20, ratio: 0.8 });
  });

  it('sorts newest first and groups by day', () => {
    const a = tx({ date: '2026-11-01', createdAt: 1 });
    const b = tx({ date: '2026-11-02', createdAt: 0 });
    const c = tx({ date: '2026-11-01', createdAt: 5 });
    const sorted = sortTransactions([a, b, c]);
    expect(sorted.map((t) => t.id)).toEqual([b.id, c.id, a.id]);
    expect(groupByDay(sorted).map((g) => [g.date, g.items.length])).toEqual([
      ['2026-11-02', 1],
      ['2026-11-01', 2],
    ]);
  });
});
