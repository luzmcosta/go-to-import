import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'

const DOC_OUTPUT_DIR = '.doc'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [].filter(Boolean),

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@root': fileURLToPath(new URL('../', import.meta.url)),
    },
  },

  server: {
    port: 8080,
  },
})
