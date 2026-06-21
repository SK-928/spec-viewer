import api from "./profiles/api.ts";
import general from "./profiles/general.ts";
import type { SpecLintConfig } from "./schema.ts";

/**
 * 設計書構造チェックの設定（集約）。
 * プロファイル（スタイル）は profiles/<name>.ts で個別管理し、ここで import して束ねる。
 * スタイル追加: profiles/ にファイルを作成し、下の import と profiles を1行ずつ追加するだけ。
 */
const config: SpecLintConfig = {
  discriminator: "type",
  profiles: { general, api },
};

export default config;
