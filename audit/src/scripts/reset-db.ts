import { auditDatabaseUrl } from '../config.ts';
import { openDatabase, resetDatabase } from '../db.ts';

const pool = openDatabase(auditDatabaseUrl());
await resetDatabase(pool);
await pool.end();
console.log('The audit database is back to its sample history.');
