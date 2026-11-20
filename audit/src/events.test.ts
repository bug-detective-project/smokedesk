import type { Express } from 'express';
import type mysql from 'mysql2/promise';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.ts';
import { resetDatabase } from './db.ts';
import { testDatabase } from './test/database.ts';

const CLIENT = 'http://localhost:5180';
let pool: mysql.Pool | undefined;
let app: Express;

beforeEach(async () => {
  if (pool) {
    await resetDatabase(pool);
  } else {
    pool = await testDatabase();
    app = createApp({ pool, clientOrigin: CLIENT });
  }
});

afterAll(async () => {
  await pool?.end();
});

const local = (test: request.Test) => test.set('Host', 'localhost:3002');

describe('the history', () => {
  it('starts with the creation of the sample notes, newest first', async () => {
    const { status, body } = await local(request(app).get('/events'));

    expect(status).toBe(200);
    expect(body.map((event: { action: string; noteId: number }) => [event.action, event.noteId])).toEqual([
      ['created', 3],
      ['created', 2],
      ['created', 1],
    ]);
  });

  it('keeps what the API reports', async () => {
    const posted = await local(request(app).post('/events').send({ action: 'deleted', noteId: 2, text: 'Badge' }));
    expect(posted.status).toBe(201);

    const { body } = await local(request(app).get('/events'));
    expect(body[0]).toMatchObject({ action: 'deleted', noteId: 2, text: 'Badge' });
    expect(typeof body[0].at).toBe('string');
  });

  it('refuses an event that is not a creation or a removal', async () => {
    expect((await local(request(app).post('/events').send({ action: 'edited', noteId: 2, text: 'x' }))).status).toBe(400);
    expect((await local(request(app).post('/events').send({ action: 'created', noteId: 'two', text: 'x' }))).status).toBe(
      400,
    );
  });

  it('may be read by the client page and no other', async () => {
    const fromClient = await local(request(app).get('/events').set('Origin', CLIENT));
    expect(fromClient.headers['access-control-allow-origin']).toBe(CLIENT);

    const fromOther = await local(request(app).get('/events').set('Origin', 'http://localhost:5173'));
    expect(fromOther.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('answers only local hosts', async () => {
    expect((await request(app).get('/events').set('Host', 'evil.example')).status).toBe(403);
  });
});
