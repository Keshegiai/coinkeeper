import { transactionsToCsv } from './csv';

describe('csv', () => {
  it('escapes and prefixes a BOM', () => {
    const csv = transactionsToCsv(
      [{ id: '1', userId: 'u', type: 'expense', amount: 5, categoryId: 'c', date: '2026-11-01', comment: 'кофе, "большой"', createdAt: 0 }],
      new Map([['c', { id: 'c', userId: 'u', name: 'Кафе', icon: 'coffee', color: '#000' }]]),
    );
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('2026-11-01,expense,5.00,Кафе,"кофе, ""большой"""');
  });
});
