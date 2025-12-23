import { defineConfig } from "vite";
import dns from "node:dns";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  build: {
    sourcemap: "hidden",
  },
  server: {
    host: true,
  },
  plugins: [
    react({
      babel: {
        plugins: ["react-dev-locator"],
      },
    }),

    tsconfigPaths(),
  ],
});
