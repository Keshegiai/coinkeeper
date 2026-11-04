import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Goal, GoalDraft } from '@/domain/types';
import { errorMessage } from '@/lib/http';
import { round2 } from '@/lib/money';
import { useUser } from '@/features/auth/AuthProvider';
import { useToast } from '@/ui/Toast';
import * as api from './api';

export const goalsKey = (userId: string) => ['goals', userId] as const;
const EMPTY: Goal[] = [];

export function useGoals() {
  const user = useUser();
  const query = useQuery({ queryKey: goalsKey(user.id), queryFn: ({ signal }) => api.list(user.id, signal) });
  return { ...query, goals: query.data ?? EMPTY };
}

function useGoalCache() {
  const user = useUser();
  const qc = useQueryClient();
  const toast = useToast();
  const key = goalsKey(user.id);
  return {
    user,
    qc,
    key,
    toast,
    set: (fn: (xs: Goal[]) => Goal[]) => qc.setQueryData<Goal[]>(key, (xs = []) => fn(xs)),
    settle: () => qc.invalidateQueries({ queryKey: key }),
    onError: (e: unknown) => toast({ message: errorMessage(e), tone: 'error' }),
  };
}

export function useSaveGoal() {
  const { user, set, settle, onError } = useGoalCache();
  return useMutation({
    mutationFn: (input: { draft: GoalDraft; id?: string; base?: Goal }) =>
      input.base ? api.update({ ...input.base, ...input.draft }) : api.create(user.id, input.draft),
    onSuccess: (g) => set((xs) => (xs.some((x) => x.id === g.id) ? xs.map((x) => (x.id === g.id ? g : x)) : [...xs, g])),
    onError,
    onSettled: settle,
  });
}

/** Add (or withdraw, with a negative amount) money — optimistic, rolls back on failure. */
export function useContribute() {
  const { qc, key, set, settle, onError, toast } = useGoalCache();
  return useMutation({
    mutationFn: ({ goal, amount }: { goal: Goal; amount: number }) => api.update({ ...goal, saved: round2(Math.max(0, goal.saved + amount)) }),
    onMutate: async ({ goal, amount }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Goal[]>(key);
      const saved = round2(Math.max(0, goal.saved + amount));
      set((xs) => xs.map((x) => (x.id === goal.id ? { ...x, saved } : x)));
      if (amount > 0 && goal.saved < goal.target && saved >= goal.target) toast({ message: `Цель «${goal.name}» достигнута` });
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      onError(e);
    },
    onSettled: settle,
  });
}

export function useDeleteGoal() {
  const { set, settle, onError } = useGoalCache();
  return useMutation({
    mutationFn: (g: Goal) => api.remove(g.id),
    onSuccess: (_r, g) => set((xs) => xs.filter((x) => x.id !== g.id)),
    onError,
    onSettled: settle,
  });
}
