import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';

const PORT = 8080;

export default defineConfig({
  base: './',
  server: {
    port: PORT,
  },
  preview: {
    port: PORT,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  plugins: [
    react(),
    createHtmlPlugin({
      entry: 'src/index.jsx',
      template: 'index.html',
    }),
  ],
  test: {
    globals: true, // Cleanup after each test
    environment: 'jsdom',
    testTimeout: 1000,
  },
});
