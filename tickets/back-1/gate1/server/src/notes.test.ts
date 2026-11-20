import type { Express } from 'express';
import type pg from 'pg';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.ts';
import type { AuditEvent } from './audit-client.ts';
import { SAMPLE_NOTES, resetDatabase } from './db.ts';
import { testDatabase } from './test/database.ts';

let pool: pg.Pool | undefined;
let app: Express;
const sent: AuditEvent[] = [];

beforeEach(async () => {
  if (pool) {
    await resetDatabase(pool);
  } else {
    pool = await testDatabase();
    app = createApp({ pool, sendEvent: async (event) => void sent.push(event) });
  }
  sent.length = 0;
});

afterAll(async () => {
  await pool?.end();
});

const local = (test: request.Test) => test.set('Host', 'localhost:3001');

describe('the notes', () => {
  it('are listed in the order they were written', async () => {
    const { status, body } = await local(request(app).get('/api/notes'));

    expect(status).toBe(200);
    expect(body.map((note: { text: string }) => note.text)).toEqual(SAMPLE_NOTES);
  });

  it('are written, and the audit service hears about it', async () => {
    const { status, body } = await local(request(app).post('/api/notes').send({ text: 'Order more coffee' }));

    expect(status).toBe(201);
    expect(body).toMatchObject({ id: 4, text: 'Order more coffee' });
    expect(sent).toEqual([{ action: 'created', noteId: 4, text: 'Order more coffee' }]);
  });

  it('refuses an empty note or one too long', async () => {
    expect((await local(request(app).post('/api/notes').send({ text: '  ' }))).status).toBe(400);
    expect((await local(request(app).post('/api/notes').send({ text: 'x'.repeat(201) }))).status).toBe(400);
    expect(sent).toEqual([]);
  });

  it('are deleted', async () => {
    expect((await local(request(app).delete('/api/notes/1'))).status).toBe(204);

    const { body } = await local(request(app).get('/api/notes'));
    expect(body).toHaveLength(2);
  });

  it('answer 404 for a note that does not exist', async () => {
    expect((await local(request(app).delete('/api/notes/99'))).status).toBe(404);
  });

  it('answer only the local client', async () => {
    expect((await request(app).get('/api/notes').set('Host', 'evil.example')).status).toBe(403);
  });
});
