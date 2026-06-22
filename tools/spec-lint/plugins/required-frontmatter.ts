import type { Root } from "mdast";
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import { extractFrontmatter } from "../frontmatter.ts";
import type { FrontmatterFieldRule, FrontmatterType } from "../schema.ts";

/** 必須 frontmatter フィールド（とその型）を検証する unified プラグイン。 */
export const requiredFrontmatter: Plugin<
  [FrontmatterFieldRule[]],
  Root,
  Root
> = (rules) => {
  return (tree: Root, file: VFile) => {
    const data = extractFrontmatter(tree);
    for (const rule of rules) {
      const has = Object.hasOwn(data, rule.name);
      if (rule.required && !has) {
        file.message(
          `必須フィールド「${rule.name}」が frontmatter にありません`,
          tree,
          "required-frontmatter",
        ).fatal = true;
        continue;
      }
      if (
        has &&
        rule.type !== undefined &&
        !matchesType(data[rule.name], rule.type)
      ) {
        file.message(
          `フィールド「${rule.name}」の型が不正です（期待: ${rule.type}）`,
          tree,
          "required-frontmatter",
        ).fatal = true;
      }
    }
  };
};

function matchesType(value: unknown, expected: FrontmatterType): boolean {
  switch (expected) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "array":
      return Array.isArray(value);
    case "object":
      return (
        typeof value === "object" && value !== null && !Array.isArray(value)
      );
  }
}
