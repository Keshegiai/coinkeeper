import { planGoal, pluralMonths } from './math';

describe('goal planning', () => {
  it('splits the remainder over the months left', () => {
    const p = planGoal({ target: 1200, saved: 200, deadline: '2027-04-20' }, '2026-11-04');
    expect(p.progress).toBeCloseTo(1 / 6);
    expect(p.remaining).toBe(1000);
    expect(p.monthsLeft).toBe(6);
    expect(p.perMonth).toBeCloseTo(166.67);
  });

  it('treats a deadline later this month as one month', () => {
    expect(planGoal({ target: 100, saved: 0, deadline: '2026-11-30' }, '2026-11-04').monthsLeft).toBe(1);
  });

  it('flags done and overdue goals', () => {
    expect(planGoal({ target: 100, saved: 120, deadline: '2026-01-01' }, '2026-11-04')).toMatchObject({ done: true, overdue: false, progress: 1, perMonth: null });
    expect(planGoal({ target: 100, saved: 20, deadline: '2026-10-01' }, '2026-11-04')).toMatchObject({ done: false, overdue: true, monthsLeft: 0 });
    expect(planGoal({ target: 100, saved: 20, deadline: null })).toMatchObject({ monthsLeft: null, perMonth: null });
  });

  it('pluralises months in Russian', () => {
    expect([1, 2, 5, 11, 21, 24].map(pluralMonths)).toEqual(['1 месяц', '2 месяца', '5 месяцев', '11 месяцев', '21 месяц', '24 месяца']);
  });
});
