import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // مسارات نسبية حتى تعمل النسخة المبنية من مجلد dist
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    open: '/dev.html',
  },
  preview: {
    host: true,
    port: 4173,
    open: true,
  },
  build: {
    rollupOptions: {
      input: resolve(rootDir, 'dev.html'),
    },
  },
})
