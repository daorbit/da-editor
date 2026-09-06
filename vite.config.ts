import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DaEditor',
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Everything in `dependencies` stays external: npm installs it anyway,
      // and bundling copies of Slate/Prism defeats deduping when the consumer
      // already has them.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'slate',
        'slate-dom',
        'slate-react',
        'slate-history',
        'is-hotkey',
        'prismjs',
        'frimousse',
        'react-colorful',
        'mammoth',
        /^prismjs\//,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: 'da-editor.[ext]',
      },
    },
    sourcemap: false,
  },
});
