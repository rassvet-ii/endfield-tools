import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';
import { defineConfig } from 'vite';
import { ViteToml as toml } from 'vite-plugin-toml';
import paths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [vike(), react(), tailwindcss(), toml(), paths()],
});
