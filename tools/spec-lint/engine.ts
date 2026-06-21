import { readFileSync } from "node:fs";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { VFile } from "vfile";
import { extractFrontmatter } from "./frontmatter.ts";
import { requiredFrontmatter } from "./plugins/required-frontmatter.ts";
import { requiredSections } from "./plugins/required-sections.ts";
import type { SpecLintConfig } from "./schema.ts";

/**
 * 1 つの Markdown ファイルを検査し、メッセージを蓄積した VFile を返す。
 * frontmatter からプロファイルを決定し、そのプロファイルのルールで検証する。
 */
export async function lintFile(
  path: string,
  config: SpecLintConfig,
): Promise<VFile> {
  const value = readFileSync(path, "utf8");
  const file = new VFile({ path, value });

  const base = unified().use(remarkParse).use(remarkFrontmatter, ["yaml"]);
  const tree = base.parse(file);

  const frontmatter = extractFrontmatter(tree);
  const profileKey = readDiscriminator(frontmatter, config.discriminator);

  const profile = config.profiles[profileKey];
  if (!profile) {
    return file;
  }

  const runner = unified()
    .use(requiredSections, profile.requiredSections)
    .use(requiredFrontmatter, profile.requiredFrontmatter);

  await runner.run(tree, file);

  return file;
}

function readDiscriminator(
  frontmatter: Record<string, unknown>,
  key: string,
): string {
  const value = frontmatter[key];
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return "";
}
