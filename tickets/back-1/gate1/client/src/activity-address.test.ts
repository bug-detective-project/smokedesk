import { afterEach, describe, expect, it, vi } from 'vitest';
import { listEvents } from './api/audit.ts';

afterEach(() => {
  vi.unstubAllEnvs();
});

/** Answers every request with an empty history and keeps the addresses it was asked. */
function recordFetch(): string[] {
  const asked: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      asked.push(url);
      return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }),
  );
  return asked;
}

describe('the activity', () => {
  it('is read from the audit service at the address the app was given', async () => {
    vi.stubEnv('VITE_AUDIT_URL', 'http://localhost:49152');
    const asked = recordFetch();

    await listEvents();

    expect(asked).toEqual(['http://localhost:49152/events']);
  });

  it('is read from the preferred port when no address was given', async () => {
    vi.stubEnv('VITE_AUDIT_URL', '');
    const asked = recordFetch();

    await listEvents();

    expect(asked).toEqual(['http://localhost:3002/events']);
  });
});
