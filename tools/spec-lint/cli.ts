import process from "node:process";
import { reporter } from "vfile-reporter";
import { collectTargets } from "./collect.ts";
import config from "./config.ts";
import { lintFile } from "./engine.ts";

async function main(): Promise<void> {
  const targets = await collectTargets(process.argv.slice(2));

  if (targets.length < 1) {
    process.stderr.write("検査対象の Markdown ファイルが見つかりません\n");
    process.exitCode = 1;
    return;
  }

  const results = await Promise.all(
    targets.map((path) => lintFile(path, config)),
  );

  process.stderr.write(`${reporter(results)}\n`);

  const hasError = results.some((file) =>
    file.messages.some((message) => message.fatal !== false),
  );

  process.exitCode = hasError ? 1 : 0;
}

void main().catch((error) => {
  process.stderr.write(`予期しないエラー: ${String(error)}\n`);
  process.exitCode = 1;
});
