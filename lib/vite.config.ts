import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  environments: {
    ssr: {
      build: {
        rollupOptions: {
          input: "./server/app.ts",
        },
      },
    },
  },
  plugins: [reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    hmr: {
      port: Number(process.env.VITE_HMR_PORT || 24678),
    },
  },
});
