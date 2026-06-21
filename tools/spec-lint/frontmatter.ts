import type { Root, RootContent } from "mdast";
import { parse as parseYaml } from "yaml";

/** remark-frontmatter が mdast に追加する YAML frontmatter ノード（標準 mdast 型にないため独自定義） */
type YamlNode = {
  type: "yaml";
  value: string;
};

/**
 * mdast ツリーから frontmatter を抽出し、オブジェクトとして返す。
 * frontmatter がない・空・トップレベルがオブジェクトでない場合は空オブジェクトを返す。
 */
export function extractFrontmatter(tree: Root): Record<string, unknown> {
  const children = tree.children as readonly (RootContent | YamlNode)[];
  const yamlNode = children.find(
    (node): node is YamlNode => node.type === "yaml",
  );
  if (!yamlNode) {
    return {};
  }
  const parsed = parseYaml(yamlNode.value);
  if (parsed === null || parsed === undefined) {
    return {};
  }
  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  return parsed as Record<string, unknown>;
}
