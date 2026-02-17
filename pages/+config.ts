import type { Config } from 'vike/types';
import vikeReact from 'vike-react/config';

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  extends: [vikeReact],
  // https://vike.dev/head-tags
  title: 'My Vike App',
  description: 'Demo showcasing Vike',
  lang: 'ja',
  prerender: true,
} satisfies Config;
