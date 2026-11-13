import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// All data lives in the browser's localStorage, which is tied to the exact
// address (including the port). Pin the port so the app always opens at
// http://localhost:5173 and finds the same saved groups. strictPort makes Vite
// stop with an error instead of silently moving to 5174 (an empty store).
const PORT = 5173

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: PORT, strictPort: true },
  preview: { port: PORT, strictPort: true },
})
