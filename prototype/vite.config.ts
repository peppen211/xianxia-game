import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this project from /xianxia-game/prototype/ when deployed
  // as a subdirectory. Adjust if the deployment target changes.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
