import { createApp } from './app.ts';
import { auditDatabaseUrl, clientOrigin, port } from './config.ts';
import { isInitialized, openDatabase, resetDatabase } from './db.ts';

const pool = openDatabase(auditDatabaseUrl());
// The first start on a new database: create the table and the sample history.
if (!(await isInitialized(pool))) {
  await resetDatabase(pool);
}

createApp({ pool, clientOrigin: clientOrigin() }).listen(port, '0.0.0.0', () => {
  console.log(`Smoke Desk audit service on http://localhost:${port}`);
});
