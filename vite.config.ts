import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/developer-open-book/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
