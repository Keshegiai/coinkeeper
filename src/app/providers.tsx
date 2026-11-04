import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { PreferencesProvider } from '@/features/settings/PreferencesProvider';
import { ToastProvider } from '@/ui/Toast';
import { ConfirmProvider } from '@/ui/Confirm';
import { ApiError } from '@/lib/http';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: (count, err) => !(err instanceof ApiError && err.status >= 400 && err.status < 500) && count < 2,
      },
      mutations: { retry: 0 },
    },
  });
}

const queryClient = createQueryClient();

export function AppProviders({ children, client = queryClient }: { children: ReactNode; client?: QueryClient }) {
  return (
    <QueryClientProvider client={client}>
      <PreferencesProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AuthProvider>{children}</AuthProvider>
          </ConfirmProvider>
        </ToastProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}
