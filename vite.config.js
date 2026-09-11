import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// En GitHub Pages la web cuelga de /regalo/ (nombre del repo); en dev, de /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/regalo/' : '/',
  plugins: [react(), tailwindcss()],
}))
