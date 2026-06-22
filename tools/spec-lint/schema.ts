/**
 * 設計書の構造チェック設定の型スキーマ。
 * プロファイル（スタイル）ごとにルールセットを持ち、frontmatter の値で切替える。
 */

export type FrontmatterType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object";

export interface RequiredSectionRule {
  /** 必須とする見出しテキスト（前後の空白・強調を除いたプレーンテキストで比較） */
  heading: string;
  /** 見出しレベル（1=H1, 2=H2, ...）。指定レベルと一致する見出しのみ対象 */
  depth: number;
  /** 配下に必須となる子セクション（この見出しの下位階層にネストして検証） */
  children?: RequiredSectionRule[];
}

export interface FrontmatterFieldRule {
  name: string;
  required: boolean;
  type?: FrontmatterType;
}

export interface SpecProfile {
  requiredSections: RequiredSectionRule[];
  requiredFrontmatter: FrontmatterFieldRule[];
}

export interface SpecLintConfig {
  /** frontmatter のどのキーでプロファイルを切り替えるか（例: "type"） */
  discriminator: string;
  /** プロファイル名 → ルールセット */
  profiles: Record<string, SpecProfile>;
}
