import { formatAmount, formatMoney, formatPercent, parseAmount } from './money';

describe('money', () => {
  it('formats with plain-space grouping', () => {
    expect(formatAmount(1234567)).toBe('1 234 567');
    expect(formatAmount(1234.5)).toBe('1 234,50');
  });

  it('formats money with sign and symbol', () => {
    expect(formatMoney(-1500, 'KZT')).toBe('−1 500 ₸');
    expect(formatMoney(1500, 'USD', { signed: true })).toBe('+1 500 $');
    expect(formatMoney(0, 'EUR', { signed: true })).toBe('0 €');
  });

  it('parses user input leniently but strictly', () => {
    expect(parseAmount('1 250,5')).toBe(1250.5);
    expect(parseAmount('99.99')).toBe(99.99);
    expect(parseAmount('1.234')).toBeNaN();
    expect(parseAmount('-5')).toBeNaN();
    expect(parseAmount('abc')).toBeNaN();
  });

  it('formats percent', () => {
    expect(formatPercent(0.256)).toBe('26%');
    expect(formatPercent(0.256, 1)).toBe('25,6%');
    expect(formatPercent(Number.NaN)).toBe('—');
  });
});
