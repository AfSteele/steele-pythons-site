import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import astroAws from "@astro-aws/adapter";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
  output: "server",
  adapter: astroAws({
    mode: "ssr-stream",
  }),
  image: {
    domains: ["steelepythons4.wordpress.com"],
  },
});