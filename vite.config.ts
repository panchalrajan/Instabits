import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'public/icons/*',
          dest: 'icons'
        },
        {
          src: 'manifest.json',
          dest: '.'
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: false,
    target: 'esnext',
    rollupOptions: {
      input: {
        // Background service worker
        background: resolve(__dirname, 'src/background/service-worker.ts'),

        // Dashboard
        dashboard: resolve(__dirname, 'src/dashboard/index.html'),

        // Feature bundles (lazy loaded)
        'features/playback-speed': resolve(__dirname, 'src/features/video/playback-speed/index.ts'),
        'features/volume-slider': resolve(__dirname, 'src/features/video/volume-slider/index.ts'),
        'features/seekbar': resolve(__dirname, 'src/features/video/seekbar/index.ts'),
        'features/duration': resolve(__dirname, 'src/features/video/duration/index.ts'),
        'features/pip': resolve(__dirname, 'src/features/video/pip/index.ts'),
        'features/fullscreen': resolve(__dirname, 'src/features/video/fullscreen/index.ts'),
        'features/background-play': resolve(__dirname, 'src/features/video/background-play/index.ts'),
        'features/zen-mode': resolve(__dirname, 'src/features/video/zen-mode/index.ts'),
        'features/auto-scroll': resolve(__dirname, 'src/features/automation/auto-scroll/index.ts'),
      },
      output: {
        format: 'es',
        entryFileNames: (chunkInfo) => {
          // Background service worker
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          // Content script
          if (chunkInfo.name === 'content') {
            return 'content/main.js';
          }
          // Feature bundles
          if (chunkInfo.name.startsWith('features/')) {
            return `${chunkInfo.name}.js`;
          }
          // Dashboard
          if (chunkInfo.name === 'dashboard') {
            return 'dashboard/app.js';
          }
          return '[name].js';
        },
        chunkFileNames: (chunkInfo) => {
          // Put chunks in the same directory as the content script for easier loading
          return 'chunks/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          // CSS files
          if (assetInfo.name?.endsWith('.css')) {
            if (assetInfo.name.includes('dashboard')) {
              return 'dashboard/[name][extname]';
            }
            return 'styles/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
        manualChunks: (id) => {
          // Don't create separate chunks for content script dependencies
          // Bundle everything together for content scripts
          if (id.includes('src/content/')) {
            return undefined;
          }

          // Core services (shared across background and features)
          if (id.includes('src/core/services/')) {
            return 'core-services';
          }

          // Feature system (shared across features)
          if (id.includes('src/core/feature-system/') ||
              id.includes('src/core/observers/') ||
              id.includes('src/core/managers/')) {
            return 'feature-system';
          }
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true,
        pure_funcs: ['console.debug']
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
