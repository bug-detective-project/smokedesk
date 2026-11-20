import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { auditClient } from './audit-client.ts';

let close: (() => void) | undefined;

afterEach(() => close?.());

/** A stand-in for the audit service: keeps what it receives and answers with `status`. */
async function fakeAudit(status: number): Promise<{ url: string; received: { path?: string; body: unknown }[] }> {
  const received: { path?: string; body: unknown }[] = [];
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      received.push({ path: req.url, body: JSON.parse(body) });
      res.writeHead(status).end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  close = () => server.close();
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, received };
}

describe('the audit client', () => {
  it('posts each event to the audit service', async () => {
    const audit = await fakeAudit(201);

    await auditClient(audit.url)({ action: 'deleted', noteId: 2, text: 'Badge for the new intern' });

    expect(audit.received).toEqual([
      { path: '/events', body: { action: 'deleted', noteId: 2, text: 'Badge for the new intern' } },
    ]);
  });

  it('fails when the audit service refuses the event', async () => {
    const audit = await fakeAudit(500);

    await expect(auditClient(audit.url)({ action: 'created', noteId: 1, text: 'x' })).rejects.toThrow(/500/);
  });
});
