import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/SuveyTool4MBA/' : '/',
  plugins: [react(), tailwindcss()],
})
