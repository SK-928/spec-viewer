import type { SpecProfile } from "../schema.ts";

/**
 * API 仕様書プロファイル。
 * frontmatter で `type: api` が指定された場合に適用される。
 */
const api: SpecProfile = {
  requiredFrontmatter: [
    { name: "title", required: true, type: "string" },
    { name: "type", required: true, type: "string" },
  ],
  requiredSections: [
    { heading: "エンドポイント", depth: 2 },
    {
      heading: "リクエスト",
      depth: 2,
      children: [
        {
          heading: "成功時",
          depth: 3,
          children: [{ heading: "サンプル", depth: 4 }],
        },
        {
          heading: "失敗時",
          depth: 3,
          children: [{ heading: "サンプル", depth: 4 }],
        },
      ],
    },
    { heading: "レスポンス", depth: 2 },
  ],
};

export default api;
