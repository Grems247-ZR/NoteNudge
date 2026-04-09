import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      // 开发时，兼容 Netlify Functions 路径到本地 Express
      '/.netlify/functions': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace('/.netlify/functions', '/api'),
      },
      // 兼容保留：本地直接访问 /api 也可用
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
