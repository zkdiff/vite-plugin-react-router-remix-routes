import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// import { reactRouterRemixRoutes } from 'vite-plugin-react-router-remix-routes'
import { reactRouterRemixRoutes } from "../src/index";
import { flatRoutes } from "@remix-run/dev/dist/config/flat-routes";

export default defineConfig({
  plugins: [react(), reactRouterRemixRoutes(flatRoutes, "./src", [], "routes")],
});
