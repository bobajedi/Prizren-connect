import { defineConfig } from 'vite'
import vue from '@vitejs/vue'

// Vercel'de ve yerelde sorunsuz derlenen standart Vite ayarı
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})