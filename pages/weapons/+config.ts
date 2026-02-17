import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: '武器選択',
  description: "基質厳選補助ツール",
  extends: [vikeReact],
} satisfies Config;
