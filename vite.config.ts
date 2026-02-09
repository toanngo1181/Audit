
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          // [FIX] Using path.resolve('.') as a replacement for process.cwd() to resolve the TypeScript error 'Property cwd does not exist on type Process'
          // This resolves the current working directory relative to where the command is run.
          '@': path.resolve('.'),
        }
      }
    };
});
