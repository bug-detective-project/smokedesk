import pg from 'pg';
import { notesDatabaseUrl } from '../config.ts';
import { openDatabase, resetDatabase } from '../db.ts';

/** The tests never touch the database of NOTES_DATABASE_URL: they use this one, on the same server. */
export const TEST_DATABASE = 'notes_test';

export async function testDatabase(): Promise<pg.Pool> {
  const admin = new pg.Client({ connectionString: notesDatabaseUrl() });
  await admin.connect();
  try {
    const found = await admin.query('select 1 from pg_database where datname = $1', [TEST_DATABASE]);
    if (found.rowCount === 0) {
      await admin.query(`create database ${TEST_DATABASE}`);
    }
  } finally {
    await admin.end();
  }
  const url = new URL(notesDatabaseUrl());
  url.pathname = `/${TEST_DATABASE}`;
  const pool = openDatabase(url.toString());
  await resetDatabase(pool);
  return pool;
}
