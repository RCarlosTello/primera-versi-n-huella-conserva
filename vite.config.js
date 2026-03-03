import { defineConfig } from 'vite';

export default defineConfig({
    // Base para GitHub Pages: /<nombre-del-repo>/
    // En Vercel se sirve desde la raíz '/', la variable de entorno lo controla.
    base: process.env.VITE_BASE_URL || '/',

    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
            input: 'index.html',
        },
    },

    server: {
        port: 3000,
        open: true,
    },
});
