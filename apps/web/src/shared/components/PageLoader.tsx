import React from 'react';
import { motion } from 'framer-motion';

export function PageLoader({ fullScreen = true }: { fullScreen?: boolean } = {}): React.ReactElement {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-50' : 'flex-1 h-full w-full min-h-[400px]'} flex items-center justify-center bg-background`}>
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Brand logo mark */}
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-brand">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 text-white"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              fill="currentColor"
            />
          </svg>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-xl animate-pulse-glow opacity-50" />
        </div>

        {/* Spinner dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
