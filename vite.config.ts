import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import vitePaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [solidPlugin(), vitePaths()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
