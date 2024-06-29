/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  base: './',
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
