import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  plugins: [],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: 'mylib',
      formats: ['es', 'cjs', 'umd', 'iife'],
      fileName: (format) => `index.${format}.js`,
    },
  },
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json-summary', 'html'],
    },
  },
});
