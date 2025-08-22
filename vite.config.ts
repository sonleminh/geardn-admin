import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    // proxy: {
    //   // REST
    //   '/api': {
    //     target: 'http://localhost:8080', // Nest
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   // SSE
    //   '/realtime': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false,
    //     // nếu BE là /api/v1/realtime/stream thì rewrite như dưới
    //     rewrite: (p) => p.replace(/^\/realtime/, '/api/realtime'),
    //   },
    // },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@server": path.resolve(__dirname, "server/src"),
    },
  },
})
