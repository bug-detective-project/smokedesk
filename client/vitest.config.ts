import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

// The tests run in UTC, so they give the same result on every computer, whatever its time zone.
process.env.TZ = 'UTC';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'client',
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  }),
);
