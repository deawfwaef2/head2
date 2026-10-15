// 安全版 · Vite 配置（与主项目 vite.config.js 同构；依赖可复用仓库根目录 node_modules）
import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  server: { host: '0.0.0.0', port: 5174, allowedHosts: true, fs: { allow: ['..'] } },
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
