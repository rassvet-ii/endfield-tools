import type { Config } from 'vike/types';
import vikeReact from 'vike-react/config';

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  extends: [vikeReact],
  // https://vike.dev/head-tags
  title: '武器選択',
  description: '基質厳選補助ツール',
  lang: 'ja',
  prerender: true,
} satisfies Config;
