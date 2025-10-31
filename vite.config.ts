import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // relative paths work anywhere (safe for GH Pages)
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})

