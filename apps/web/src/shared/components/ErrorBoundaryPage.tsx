import React from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorBoundaryPage(): React.ReactElement {
  const error = useRouteError() as any;
  console.error('Unhandled route error:', error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">
            An unexpected error occurred. Please refresh the page to continue.
          </p>
          {import.meta.env.DEV && error && (
            <pre className="mt-4 rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground overflow-auto max-h-40">
              {error.message || error.statusText || String(error)}
            </pre>
          )}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh page
        </button>
      </div>
    </div>
  );
}
