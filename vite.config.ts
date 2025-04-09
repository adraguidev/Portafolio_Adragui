import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import type { ModuleFormat } from 'rollup';

const config = {
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'es' as ModuleFormat,
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'wouter': 'Wouter',
          'react-i18next': 'ReactI18next',
          'i18next': 'i18next'
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  server: {
    port: 3000,
  },
};

// Solo añadir cartographer en desarrollo y en Replit
if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
  import("@replit/vite-plugin-cartographer").then(({ cartographer }) => {
    config.plugins.push(cartographer());
  });
}

export default defineConfig(config);
