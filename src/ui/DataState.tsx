import type { ReactNode } from 'react';
import { RotateCw } from 'lucide-react';
import { Button } from './Button';
import { EmptyState, Loader } from './EmptyState';

/** Uniform loading/error handling for data-driven screens. */
export function DataState({ isLoading, error, retry, children }: { isLoading: boolean; error: string | null; retry: () => void; children: ReactNode }) {
  if (isLoading) return <Loader />;
  if (error)
    return (
      <EmptyState
        title="Не удалось загрузить данные"
        text={error}
        action={
          <Button icon={<RotateCw size={14} />} onClick={retry}>
            Повторить
          </Button>
        }
      />
    );
  return <>{children}</>;
}
