import { allocateCells } from './Waffle';

describe('allocateCells', () => {
  it('always sums to the total', () => {
    const out = allocateCells([1, 1, 1], 100);
    expect(out.reduce((a, b) => a + b, 0)).toBe(100);
    expect(out).toEqual([34, 33, 33]);
  });
  it('handles empty input', () => {
    expect(allocateCells([0, 0], 100)).toEqual([0, 0]);
  });
});
