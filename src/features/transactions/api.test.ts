import { normalizeTransaction } from './api';
import { normalizeCategory } from '@/features/categories/api';

describe('normalisation of legacy records', () => {
  it('reads categoryId from the embedded v1 category object', () => {
    const t = normalizeTransaction({
      id: '6ef5',
      userId: '9450',
      type: 'expense',
      amount: 550,
      category: { id: '8445' },
      date: '2025-05-07',
      comment: null,
    } as never);
    expect(t).toMatchObject({ categoryId: '8445', comment: '', createdAt: 0 });
  });

  it('maps unknown icon names to a default', () => {
    expect(normalizeCategory({ id: '1', userId: 'u', name: 'X', icon: 'LuShapes', color: '' }).icon).toBe('shapes');
    expect(normalizeCategory({ id: '1', userId: 'u', name: 'X', icon: 'coffee', color: '#fff', budget: 0 })).toMatchObject({ icon: 'coffee', budget: null });
  });
});
