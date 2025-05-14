import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    threads: false,   // 禁用 worker threads
    isolate: false, 
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    includeSource: ['src/**/*.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    css: true,
    reporters: ['default', 'html', 'json'], // 添加报告类型
    outputFile: {
      json: 'test-report.json',
      html: 'test-report.html',},
    deps: {
      inline: [
        '@chakra-ui/react',
        'react-router-dom'
      ],
    },
  },
}); 