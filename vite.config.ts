import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'log-server-status',
      configureServer(server) {
        server.httpServer?.on('listening', () => {
          console.log(`
🚀 Vite frontend server started successfully!
🌍 Local: http://localhost:5173/
📦 Assets: /public, /src/assets
          `);
        });
        
        server.httpServer?.on('close', () => {
          console.log('🛑 Vite frontend server stopped');
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443,
      path: 'hmr-ws'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
});