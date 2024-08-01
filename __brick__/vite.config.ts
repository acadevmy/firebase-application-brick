import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  envPrefix: '{{applicationName.constantCase()}}_',
  envDir: '../..',
  optimizeDeps: {
    exclude: ['class-transformer', 'class-validator'],
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'nest',
      appPath: 'src/main.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'swc',
      initAppOnBoot: false,
    }),
  ],
});
