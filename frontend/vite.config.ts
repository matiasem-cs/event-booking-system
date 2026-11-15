import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 1000,
    outDir: 'dist'
  },
  plugins: [react()],
})
