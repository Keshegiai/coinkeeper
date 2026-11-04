import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Category, CategoryDraft } from '@/domain/types';
import { errorMessage } from '@/lib/http';
import { useUser } from '@/features/auth/AuthProvider';
import { useToast } from '@/ui/Toast';
import * as api from './api';

export const categoriesKey = (userId: string) => ['categories', userId] as const;

export function useCategories() {
  const user = useUser();
  const query = useQuery({
    queryKey: categoriesKey(user.id),
    queryFn: ({ signal }) => api.list(user.id, signal),
  });
  const categories = query.data ?? EMPTY;
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  return { ...query, categories, byId };
}
const EMPTY: Category[] = [];

function useCategoryMutations() {
  const user = useUser();
  const qc = useQueryClient();
  const toast = useToast();
  const key = categoriesKey(user.id);
  const onError = (e: unknown) => toast({ message: errorMessage(e), tone: 'error' });
  const settle = () => qc.invalidateQueries({ queryKey: key });
  const set = (fn: (xs: Category[]) => Category[]) => qc.setQueryData<Category[]>(key, (xs = []) => fn(xs));
  return { user, qc, key, set, onError, settle };
}

const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase('ru') === b.trim().toLocaleLowerCase('ru');

export function useCreateCategory() {
  const { user, qc, key, set, onError, settle } = useCategoryMutations();
  return useMutation({
    mutationFn: async (draft: CategoryDraft) => {
      const existing = qc.getQueryData<Category[]>(key) ?? [];
      if (existing.some((c) => sameName(c.name, draft.name))) throw new Error('Категория с таким названием уже есть');
      return api.create(user.id, { ...draft, name: draft.name.trim() });
    },
    onSuccess: (c) => set((xs) => [...xs, c].sort((a, b) => a.name.localeCompare(b.name, 'ru'))),
    onError,
    onSettled: settle,
  });
}

export function useUpdateCategory() {
  const { qc, key, set, onError, settle } = useCategoryMutations();
  return useMutation({
    mutationFn: async (c: Category) => {
      const existing = qc.getQueryData<Category[]>(key) ?? [];
      if (existing.some((x) => x.id !== c.id && sameName(x.name, c.name))) throw new Error('Категория с таким названием уже есть');
      return api.update({ ...c, name: c.name.trim() });
    },
    onSuccess: (c) => set((xs) => xs.map((x) => (x.id === c.id ? c : x))),
    onError,
    onSettled: settle,
  });
}

export function useDeleteCategory() {
  const { set, onError, settle } = useCategoryMutations();
  return useMutation({
    mutationFn: (c: Category) => api.remove(c.id),
    onSuccess: (_r, c) => set((xs) => xs.filter((x) => x.id !== c.id)),
    onError,
    onSettled: settle,
  });
}
