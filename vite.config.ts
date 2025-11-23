import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'rss-parser': 'rss-parser/dist/rss-parser.min.js',
    },
  },
  plugins: [react()],

  build: {
    // Add tailwindcss to the list of external dependencies
    rollupOptions: {
      external: ['tailwindcss'],
    },
  },
})
