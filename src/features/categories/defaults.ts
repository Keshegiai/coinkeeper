import type { CategoryDraft } from '@/domain/types';
import * as api from './api';

/** Sensible starter set so a new account isn't an empty screen. */
export const DEFAULT_CATEGORIES: CategoryDraft[] = [
  { name: 'Продукты', icon: 'cart', color: '#2E9E5B' },
  { name: 'Кафе', icon: 'coffee', color: '#F26B1D' },
  { name: 'Транспорт', icon: 'bus', color: '#1C7ED6' },
  { name: 'Дом', icon: 'home', color: '#5C5C5C' },
  { name: 'Связь', icon: 'wifi', color: '#6741D9' },
  { name: 'Здоровье', icon: 'health', color: '#D71921' },
  { name: 'Развлечения', icon: 'film', color: '#C2255C' },
  { name: 'Зарплата', icon: 'salary', color: '#111111' },
];

export async function createDefaultCategories(userId: string) {
  await Promise.all(DEFAULT_CATEGORIES.map((c) => api.create(userId, c)));
}
