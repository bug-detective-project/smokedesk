import { createApp } from './app.ts';
import { auditClient } from './audit-client.ts';
import { auditInternalUrl, notesDatabaseUrl, port } from './config.ts';
import { isInitialized, openDatabase, resetDatabase } from './db.ts';

const pool = openDatabase(notesDatabaseUrl());
// The first start on a new database: create the table and the sample notes.
if (!(await isInitialized(pool))) {
  await resetDatabase(pool);
}

createApp({ pool, sendEvent: auditClient(auditInternalUrl()) }).listen(port, '0.0.0.0', () => {
  console.log(`Smoke Desk API on http://localhost:${port}`);
});
