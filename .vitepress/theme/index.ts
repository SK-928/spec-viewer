// https://vitepress.dev/guide/custom-theme

import type { Theme } from "vitepress";
import Layout from "./Layout.vue";
import "./style.css";

export default {
  Layout,
} satisfies Theme;
