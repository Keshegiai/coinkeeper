import type { Goal, GoalDraft } from '@/domain/types';
import { request } from '@/lib/http';

type RawGoal = Partial<Goal> & { id: string | number; userId: string | number };

export const normalizeGoal = (raw: RawGoal): Goal => ({
  id: String(raw.id),
  userId: String(raw.userId),
  name: raw.name ?? 'Цель',
  target: Number(raw.target) || 0,
  saved: Number(raw.saved) || 0,
  deadline: raw.deadline || null,
  icon: raw.icon ?? 'savings',
  color: raw.color ?? '#D71921',
  createdAt: Number(raw.createdAt) || 0,
});

export async function list(userId: string, signal?: AbortSignal) {
  const rows = await request<RawGoal[]>('/goals', { where: { userId }, signal });
  return rows.map(normalizeGoal).sort((a, b) => a.createdAt - b.createdAt);
}

export async function create(userId: string, draft: GoalDraft) {
  return normalizeGoal(await request<RawGoal>('/goals', { method: 'POST', body: { ...draft, userId, createdAt: Date.now() } }));
}

export async function update(g: Goal) {
  return normalizeGoal(await request<RawGoal>(`/goals/${g.id}`, { method: 'PUT', body: { ...g } }));
}

export async function remove(id: string) {
  await request<unknown>(`/goals/${id}`, { method: 'DELETE' });
}
