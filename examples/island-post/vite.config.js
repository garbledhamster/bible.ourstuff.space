import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const at = (path) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  root: at('./'),
  base: './',
  build: {
    // Phaser loads these SVGs as files and rasterizes them at their declared size.
    assetsInlineLimit: 0,
    outDir: at('../../dist/island-post/'),
    emptyOutDir: true,
    rollupOptions: { input: { dock: at('index.html'), sandbox: at('sandbox/index.html') } },
  },
});
