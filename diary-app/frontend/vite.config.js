import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Set base to your GitHub repo name for GitHub Pages deployment
  // e.g. base: '/my-diary/'
  // For custom domain, use base: '/'
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
});
