import express from 'express';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import type mysql from 'mysql2/promise';
import { addEvent, listEvents } from './db.ts';

export interface AppOptions {
  pool: mysql.Pool;
  /** The only page that may read the history from the browser. */
  clientOrigin: string;
  log?: (line: string) => void;
}

export function createApp({ pool, clientOrigin, log = (line) => console.error(line) }: AppOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(allowedHost);
  app.use(cors(clientOrigin));
  app.use(express.json({ limit: '10kb' }));

  app.get('/events', async (_req, res) => {
    res.json(await listEvents(pool));
  });

  // The API reports each change to a note here, from inside the workspace.
  app.post('/events', async (req, res) => {
    const { action, noteId, text } = req.body ?? {};
    const valid
      = (action === 'created' || action === 'deleted')
        && Number.isInteger(noteId)
        && typeof text === 'string'
        && text.length <= 200;
    if (!valid) {
      res.status(400).json({ error: 'An event has an action (created or deleted), a noteId and a text' });
      return;
    }
    await addEvent(pool, { action, noteId, text });
    res.status(201).end();
  });

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
  app.use(handleError(log));
  return app;
}

/** The browser lets the client page read the answers; any other page gets no CORS header. */
function cors(origin: string): RequestHandler {
  return (req, res, next) => {
    if (req.headers.origin === origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    next();
  };
}

/** Hosts the service answers; the port is ignored. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

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
    res.status(500).json({ error: 'Something went wrong in the audit service' });
  };
}
