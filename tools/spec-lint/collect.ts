import { resolve } from "node:path";
import process from "node:process";
import fastGlob from "fast-glob";

/**
 * 検査対象の Markdown ファイル一覧を決定する。
 * - 引数なし: specs 配下の .md ファイルをすべてスキャン
 * - 引数あり: 指定ファイルのうち specs 配下の .md のみ（lint-staged 用）
 */
export async function collectTargets(
  args: readonly string[],
): Promise<string[]> {
  const cwd = process.cwd();

  if (args.length < 1) {
    const files = await fastGlob("specs/**/*.md", { cwd, absolute: true });
    return files.sort();
  }

  const absPaths = args.map((arg) => resolve(cwd, arg));
  return absPaths.filter(
    (absPath) => isUnderSpecs(absPath, cwd) && absPath.endsWith(".md"),
  );
}

/**
 * 対象ファイルが specs 配下にあるかを判定する
 */
function isUnderSpecs(absPath: string, cwd: string): boolean {
  const specsDir = resolve(cwd, "specs");
  return absPath === specsDir || absPath.startsWith(`${specsDir}/`);
}
