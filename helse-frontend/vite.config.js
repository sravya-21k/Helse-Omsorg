import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = "Helse-Omsorg"

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
  build: {
    outDir: "docs"   
  }
})
