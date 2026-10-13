import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Relative assets support both root hosting and GitHub Pages repository URLs.
export default defineConfig({ plugins: [react()], base: './', resolve: { preserveSymlinks: true }, build: { chunkSizeWarningLimit: 1800 } });
