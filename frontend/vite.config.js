import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// 開發時，將 /api 開頭的請求代理到 Spring Boot（localhost:8080）
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/NOIRSON/' : '/',
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
}))
