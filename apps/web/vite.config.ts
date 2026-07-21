import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shiftly/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@shiftly/shared-constants': path.resolve(__dirname, '../../packages/shared-constants/src'),
      '@shiftly/shared-validation': path.resolve(__dirname, '../../packages/shared-validation/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          query: ['@tanstack/react-query'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // @ts-ignore
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/shared/components/ui/**',
        'src/shared/types/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        '.eslintrc.cjs',
      ],
    },
  },
});
