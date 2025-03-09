import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');

  console.log("Using Backend URL:", env.VITE_BACKEND_URL || 'http://127.0.0.1:5000');

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,  // Allow HTTP connections
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
