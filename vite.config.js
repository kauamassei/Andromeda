import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// O proxy evita CORS no desenvolvimento: o front chama /ai/review
// e o Vite repassa para o Spring Boot em localhost:8080.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/ai': {
                target: 'http://localhost:8080',
                changeOrigin: true,
            },
        },
    },
});
