import { relative, resolve } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { collectTargets } from "../../tools/spec-lint/collect.ts";
import specLintConfig from "../../tools/spec-lint/config.ts";
import { lintFile } from "../../tools/spec-lint/engine.ts";

/**
 * VitePress で Markdown を spec-lint で検証する Vite プラグイン。
 * - dev サーバー（specLintPlugin）:
 *   - configureServer: 起動時に srcDir 配下の全 .md を走査し、違反をターミナルに出す。
 *   - transform: ページアクセス時に検証。違反があれば this.error() で HMR を止める。
 *   - handleHotUpdate: ファイル保存時に検証。違反があれば page reload を止めてオーバーレイ表示。
 * - ビルド（specLintBuildPlugin）:
 *   - buildStart: srcDir 配下の全 .md を走査し、違反があればビルドを失敗させる。
 *
 * VitePress は .md 変更時に transform を経由せず page reload をかけるため、
 * 保存時の検証には transform ではなく handleHotUpdate が必要。
 */
export function specLintPlugin(): Plugin {
  return {
    name: "spec-lint",
    enforce: "pre",
    apply: "serve",
    configureServer(server) {
      void lintAllOnStart(server);
    },
    async transform(_code, rawId) {
      const id = rawId.split("?")[0];
      if (!id.endsWith(".md")) return null;

      const root = resolve(this.environment.config.root);
      if (id !== root && !id.startsWith(`${root}/`)) return null;

      const message = await buildErrorMessage(id);
      if (message === null) return null;

      this.error({ message, id, plugin: "spec-lint" });
    },
    async handleHotUpdate(ctx) {
      const id = ctx.file;
      if (!id.endsWith(".md")) return;

      const root = resolve(ctx.server.config.root);
      if (id !== root && !id.startsWith(`${root}/`)) return;

      const message = await buildErrorMessage(id);
      if (message === null) return;

      ctx.server.config.logger.error(`\n${message}`, { timestamp: true });

      ctx.server.ws.send({
        type: "error",
        err: { message, stack: "", id, plugin: "spec-lint" },
      });
      return [];
    },
  };
}

/** ビルド時に srcDir 配下の全 Markdown を検証し、違反があればビルドを失敗させる。 */
export function specLintBuildPlugin(): Plugin {
  return {
    name: "spec-lint-build",
    enforce: "pre",
    apply: "build",
    async buildStart() {
      const targets = await collectTargets([]);
      const violations: string[] = [];

      for (const target of targets) {
        const message = await buildErrorMessage(target);
        if (message !== null) {
          violations.push(message);
        }
      }

      if (violations.length > 0) {
        this.error(`${violations.join("\n\n")}\n`);
      }
    },
  };
}

/** 起動時に srcDir 配下の全 Markdown を検証し、違反をターミナルに出す。 */
async function lintAllOnStart(server: ViteDevServer): Promise<void> {
  const targets = await collectTargets([]);
  for (const target of targets) {
    const message = await buildErrorMessage(target);
    if (message !== null) {
      server.config.logger.error(`\n${message}`, { timestamp: true });
    }
  }
}

/** 1 つの Markdown を検証し、違反があればエラーメッセージを返す（なければ null）。 */
async function buildErrorMessage(id: string): Promise<string | null> {
  const file = await lintFile(id, specLintConfig);
  const errors = file.messages.filter((message) => message.fatal !== false);
  if (errors.length === 0) return null;
  const relPath = relative(process.cwd(), id);
  const detail = errors.map((message) => `  - ${message.reason}`).join("\n");
  return `spec-lint 違反: ${relPath}\n${detail}`;
}
