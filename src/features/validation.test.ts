import { validateTransaction } from '@/features/transactions/TransactionForm';
import { passwordScore, validateRegister } from '@/features/auth/validation';
import { computeInsights } from '@/features/analytics/insights';

describe('validation', () => {
  it('validates transactions', () => {
    expect(validateTransaction({ amount: '', categoryId: '', date: 'x' })).toEqual({
      amount: 'Введите сумму',
      categoryId: 'Выберите категорию',
      date: 'Некорректная дата',
    });
    expect(validateTransaction({ amount: '0', categoryId: 'c', date: '2026-11-04' }).amount).toBeDefined();
    expect(validateTransaction({ amount: '12,50', categoryId: 'c', date: '2026-11-04' })).toEqual({});
  });

  it('scores and validates passwords', () => {
    expect(passwordScore('aaaaaaaa')).toBe(1);
    expect(passwordScore('Aa1!aaaa')).toBe(4);
    expect(validateRegister({ name: 'A', email: 'a@b.co', password: 'Password1', confirm: 'Password1' })).toEqual({});
    expect(validateRegister({ name: '', email: 'bad', password: 'short', confirm: 'x' })).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
      confirm: expect.any(String),
    });
  });
});

describe('insights', () => {
  it('finds largest expense and busiest weekday', () => {
    const base = { userId: 'u', categoryId: 'c', comment: '', createdAt: 0 };
    const i = computeInsights(
      [
        { ...base, id: '1', type: 'expense', amount: 10, date: '2026-11-02' }, // Mon
        { ...base, id: '2', type: 'expense', amount: 40, date: '2026-11-04' }, // Wed
        { ...base, id: '3', type: 'income', amount: 999, date: '2026-11-04' },
      ],
      '2026-11-02',
      '2026-11-03',
    );
    expect(i.largestExpense?.id).toBe('2');
    expect(i.busiestWeekday?.index).toBe(2);
    expect(i.activeDays).toBe(2);
  });
});
