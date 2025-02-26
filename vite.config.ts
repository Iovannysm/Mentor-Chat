import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mentor-chat/',
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    cssMinify: true
  },
  server: {
    port: 3000
  }
})
