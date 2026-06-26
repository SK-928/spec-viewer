import container from "markdown-it-container";
import { defineConfig } from "vitepress";
import { specLintBuildPlugin, specLintPlugin } from "./plugins/spec-lint.ts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "specs",

  title: "My Awesome Project",
  description: "A VitePress Site",

  // ダークモード: OS 設定を既定にしつつ手動切替可。<html>.dark でトークンを切替える
  appearance: true,

  // 本文フォント（Inter）。テーマ自体はシステム fallback で動くが、実サイトは読み込む
  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    [
      "link",
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  ],

  markdown: {
    // ::: note をカスタムコンテナとして登録（参考実装準拠）。
    // info/tip/warning/danger/details は VitePress 標準。note は独自。
    config(md) {
      md.use(container, "note", {
        render(tokens: { nesting: number }[], idx: number) {
          return tokens[idx].nesting === 1
            ? '<div class="custom-block note"><p class="custom-block-title">注記</p>\n'
            : "</div>\n";
        },
      });
    },
  },

  vite: {
    plugins: [specLintPlugin(), specLintBuildPlugin()],
  },
});
