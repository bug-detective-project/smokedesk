import express from 'express';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import type pg from 'pg';
import type { SendEvent } from './audit-client.ts';
import { createNote, deleteNote, listNotes } from './db.ts';

export const NOTE_MAX = 200;

export interface AppOptions {
  pool: pg.Pool;
  sendEvent: SendEvent;
  log?: (line: string) => void;
}

export function createApp({ pool, sendEvent, log = (line) => console.error(line) }: AppOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(allowedHost);
  app.use(express.json({ limit: '10kb' }));

  // The audit service keeps the history; a note is saved even when it does not answer.
  const tell: SendEvent = async (event) => {
    try {
      await sendEvent(event);
    } catch (error) {
      log(`The audit service missed a ${event.action} event: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  app.get('/api/notes', async (_req, res) => {
    res.json(await listNotes(pool));
  });

  app.post('/api/notes', async (req, res) => {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (text.length === 0 || text.length > NOTE_MAX) {
      res.status(400).json({ error: `A note has 1 to ${NOTE_MAX} characters` });
      return;
    }
    const note = await createNote(pool, text);
    await tell({ action: 'created', noteId: note.id, text: note.text });
    res.status(201).json(note);
  });

  app.delete('/api/notes/:id', async (req, res) => {
    const note = await deleteNote(pool, Number(req.params.id) || 0);
    if (!note) {
      res.status(404).json({ error: 'There is no such note' });
      return;
    }
    res.status(204).end();
  });

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
  app.use(handleError(log));
  return app;
}

/** Hosts the API answers; the port is ignored. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/** Only the local client talks to the API: a page on the internet sends another Host and gets 403. */
const allowedHost: RequestHandler = (req, res, next) => {
  const host = req.headers.host ?? '';
  const name = host.startsWith('[') ? host.slice(0, host.indexOf(']') + 1) : host.replace(/:\d+$/, '');
  if (LOCAL_HOSTS.has(name.toLowerCase())) {
    next();
    return;
  }
  res.status(403).json({ error: 'Forbidden host' });
};

function handleError(log: (line: string) => void): ErrorRequestHandler {
  return (error: unknown, _req, res, _next) => {
    const status = (error as { status?: number }).status;
    if (status === 400 || status === 413) {
      res.status(status).json({ error: status === 400 ? 'The body is not valid JSON' : 'The body is too large' });
      return;
    }
    log(`Unexpected error: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
    res.status(500).json({ error: 'Something went wrong on the server' });
  };
}
