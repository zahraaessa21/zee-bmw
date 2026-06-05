// vite.config.js — Build tool configuration
// Vite is the modern replacement for Create React App.
// It's much faster because it uses native ES modules.
//
// @vitejs/plugin-react enables:
//   - JSX transform (so you don't need to import React in every file)
//   - Fast Refresh (saves state when you edit a file, no full reload)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,      // Run dev server on localhost:3000
    open: true,      // Automatically open browser when you run 'npm run dev'
  },
})
