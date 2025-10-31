import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build configuration for GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/kasaglowclean-aistudio/', // 👈 must match repo name exactly
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
