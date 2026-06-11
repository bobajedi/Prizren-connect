import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // <-- Tam olarak burayı '@vitejs/plugin-vue' yaptık!

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})