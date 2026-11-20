import { notesDatabaseUrl } from '../config.ts';
import { openDatabase, resetDatabase } from '../db.ts';

const pool = openDatabase(notesDatabaseUrl());
await resetDatabase(pool);
await pool.end();
console.log('The notes database is back to its sample notes.');
