import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Use 0.0.0.0 to listen on all interfaces
    port: 8080,
    strictPort: true,
    // HMR configuration - let Vite auto-detect the correct port for local development
    // Remove clientPort to allow auto-detection based on the server port
    // If you need to use a proxy (like in production), uncomment and configure:
    // hmr: {
    //   clientPort: 443, // For HMR over HTTPS proxy
    //   protocol: 'wss', // Use secure WebSocket over proxy
    // },
    allowedHosts: [
      "8080-if30hhlnpfew8iqkzegov-3fd74e44.manus-asia.computer",
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));

