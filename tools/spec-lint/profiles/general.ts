import type { SpecProfile } from "../schema.ts";

/**
 * 汎用プロファイル（既定）。
 * frontmatter でスタイル指定がない場合に適用される。
 */
const general: SpecProfile = {
  requiredFrontmatter: [{ name: "title", required: true, type: "string" }],
  requiredSections: [
    { heading: "目的", depth: 2 },
    { heading: "仕様", depth: 2 },
  ],
};

export default general;
