import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild'  // ← Usa esbuild en lugar de terser
  },
  server: {
    port: 3000,
    open: true
  }
});