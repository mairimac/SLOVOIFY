import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Crucial for Spotify 2026 security
    port: 5173,
    strictPort: true,
  }
})