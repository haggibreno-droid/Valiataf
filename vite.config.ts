import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Three.js is loaded only when the anatomical model is opened; its 3D engine chunk
  // is intentionally larger than the default warning threshold but small after gzip.
  build: { chunkSizeWarningLimit: 600 },
})
