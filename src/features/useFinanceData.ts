import { useCategories } from '@/features/categories/hooks';
import { useTransactions } from '@/features/transactions/hooks';
import { errorMessage } from '@/lib/http';

/** Both datasets every screen needs, with a merged status. */
export function useFinanceData() {
  const tx = useTransactions();
  const cats = useCategories();
  return {
    transactions: tx.transactions,
    categories: cats.categories,
    categoryMap: cats.byId,
    isLoading: tx.isPending || cats.isPending,
    error: tx.error ?? cats.error ? errorMessage(tx.error ?? cats.error) : null,
    retry: () => {
      void tx.refetch();
      void cats.refetch();
    },
  };
}
