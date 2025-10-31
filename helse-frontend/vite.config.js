import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = "Helse-Omsorg"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
  build: { outDir: "docs" }
 
})
