import { defineConfig } from "vitepress";
import { specLintBuildPlugin, specLintPlugin } from "./plugins/spec-lint.ts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "specs",

  title: "My Awesome Project",
  description: "A VitePress Site",

  vite: {
    plugins: [specLintPlugin(), specLintBuildPlugin()],
  },
});
