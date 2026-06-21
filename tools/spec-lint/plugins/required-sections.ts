import type { Heading, PhrasingContent, Root } from "mdast";
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import type { RequiredSectionRule } from "../schema.ts";

type HeadingNode = {
  depth: number;
  heading: string;
  children: HeadingNode[];
};

/** 必須セクション（見出し階層）の存在を検証する unified プラグイン。 */
export const requiredSections: Plugin<[RequiredSectionRule[]], Root, Root> = (
  rules,
) => {
  return (tree: Root, file: VFile) => {
    const headings = extractHeadings(tree);
    const headingTree = buildHeadingTree(headings);
    const sections = getTopLevelSections(headingTree);

    validate(sections, rules, file, tree, "");
  };
};

/** 文書の最上位セクションを取得する。H1（タイトル）1つで始まる場合はその直下、なければ roots 全体 */
function getTopLevelSections(roots: HeadingNode[]): HeadingNode[] {
  if (roots.length === 1 && roots[0].depth === 1) {
    return roots[0].children;
  }
  return roots;
}

function validate(
  sections: readonly HeadingNode[],
  rules: readonly RequiredSectionRule[],
  file: VFile,
  tree: Root,
  parentLabel: string,
): void {
  for (const rule of rules) {
    const found = sections.find(
      (section) =>
        section.depth === rule.depth && section.heading === rule.heading,
    );

    const label = parentLabel
      ? `${parentLabel} > ${rule.heading}`
      : rule.heading;

    if (!found) {
      file.message(
        `必須セクション「${label}」（H${rule.depth}）が見つかりません`,
        tree,
        "required-sections",
      ).fatal = true;
      continue;
    }

    const children = rule.children;

    if (children !== undefined && children.length > 0) {
      validate(found.children, children, file, tree, label);
    }
  }
}

function extractHeadings(tree: Root) {
  return tree.children
    .filter((node): node is Heading => node.type === "heading")
    .map((heading) => ({
      depth: heading.depth,
      heading: toPlainText(heading.children),
    }));
}

/** フラットな見出しリストを、depth に基づく親子ツリーに組み立てる */
function buildHeadingTree(
  headings: readonly { depth: number; heading: string }[],
): HeadingNode[] {
  const roots: HeadingNode[] = [];
  const stack: HeadingNode[] = [];

  for (const { depth, heading } of headings) {
    let parent = stack.at(-1);

    while (parent !== undefined && parent.depth >= depth) {
      stack.pop();
      parent = stack.at(-1);
    }

    const node: HeadingNode = { depth, heading, children: [] };

    (parent?.children ?? roots).push(node);
    stack.push(node);
  }

  return roots;
}

/** node の children を再起的にたどり、value を取得する */
function toPlainText(nodes: readonly PhrasingContent[]): string {
  return nodes
    .map((node) => {
      // value を持つ場合はそのまま返す
      if ("value" in node && typeof node.value === "string") {
        return node.value;
      }
      // children を持つ場合はは再起的に値が出るまでたどる
      if ("children" in node && Array.isArray(node.children)) {
        return toPlainText(node.children);
      }
      // それ以外は空
      return "";
    })
    .join("");
}
