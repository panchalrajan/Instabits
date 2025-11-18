import { defineConfig } from 'vite';
import { resolve } from 'path';

// Separate config for content script - bundle everything inline
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/content/main.ts'),
      name: 'InstabitsContent',
      formats: ['iife'],
      fileName: () => 'content/main.js'
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@features': resolve(__dirname, 'src/features'),
      '@utils': resolve(__dirname, 'src/core/utils'),
      '@services': resolve(__dirname, 'src/core/services')
    }
  }
});
