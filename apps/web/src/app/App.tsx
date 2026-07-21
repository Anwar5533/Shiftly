import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { store } from './store';
import { queryClient } from '@/shared/lib/query-client';
import { router } from './router';
import { ThemeProvider } from '@/shared/components/ThemeProvider';
import { useAuthInit } from '@/shared/hooks/useAuthInit';

/**
 * Inner component so it can use Redux hooks (must be inside <Provider>)
 */
function AppInner(): React.ReactElement {
  useAuthInit(); // Silently restores auth session on page refresh
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export function App(): React.ReactElement {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </Provider>
  );
}
