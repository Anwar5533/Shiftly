import React from 'react';

export function PageLoader({
  fullScreen = true,
}: { fullScreen?: boolean } = {}): React.ReactElement {
  return (
    <div
      className={`${fullScreen ? 'fixed inset-0 z-50' : 'h-full min-h-[400px] w-full flex-1'} flex items-center justify-center bg-background`}
    >
      <div className="flex flex-col items-center gap-4 duration-200 animate-in fade-in zoom-in">
        {/* Brand logo mark */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-brand">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 text-white"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
          </svg>
          {/* Pulse ring */}
          <div className="absolute inset-0 animate-pulse-glow rounded-xl opacity-50" />
        </div>

        {/* Spinner dots */}
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
}
