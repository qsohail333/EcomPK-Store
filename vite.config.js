import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // CRITICAL: This section tells Vite to use the PostCSS configuration.
  css: {
    postcss: './postcss.config.cjs', 
    // By pointing directly to the .cjs file, we ensure Vite correctly finds 
    // the Tailwind and Autoprefixer settings, bypassing potential auto-detection failures.
  },
  
  // ADDITION: Force Vite to clear its cache aggressively to resolve persistent CSS issues.
  server: {
    hmr: {
      overlay: false,
    },
    // Force cache clearing on startup
    force: true, 
  }
});