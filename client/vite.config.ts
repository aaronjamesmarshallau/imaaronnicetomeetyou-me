import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5174'
    }
  },
  build: {
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
  plugins: [react()],
})
