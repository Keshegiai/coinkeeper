import type { Category, CategoryDraft } from '@/domain/types';
import { request } from '@/lib/http';
import { normalizeIcon } from './icons';

type RawCategory = Omit<Category, 'icon'> & { icon?: string };

export const normalizeCategory = (raw: RawCategory): Category => ({
  id: String(raw.id),
  userId: String(raw.userId),
  name: raw.name,
  icon: normalizeIcon(raw.icon),
  color: raw.color || '#8A8A8A',
  budget: typeof raw.budget === 'number' && raw.budget > 0 ? raw.budget : null,
});

export async function list(userId: string, signal?: AbortSignal) {
  const rows = await request<RawCategory[]>('/categories', { where: { userId }, signal });
  return rows.map(normalizeCategory).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export async function create(userId: string, draft: CategoryDraft) {
  return normalizeCategory(await request<RawCategory>('/categories', { method: 'POST', body: { ...draft, userId } }));
}

export async function update(c: Category) {
  return normalizeCategory(await request<RawCategory>(`/categories/${c.id}`, { method: 'PUT', body: { ...c } }));
}

export async function remove(id: string) {
  await request<unknown>(`/categories/${id}`, { method: 'DELETE' });
}
