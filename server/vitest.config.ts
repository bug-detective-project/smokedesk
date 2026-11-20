import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'server',
    environment: 'node',
    // Every test file resets the same test database: one file at a time.
    fileParallelism: false,
  },
});
