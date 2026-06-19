import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The client runs on 5174 and proxies API calls to the Express server on 4000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
