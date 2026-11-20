import mysql from 'mysql2/promise';
import { auditDatabaseUrl } from '../config.ts';
import { openDatabase, resetDatabase } from '../db.ts';

/** The tests never touch the database of AUDIT_DATABASE_URL: they use this one, on the same server. */
export const TEST_DATABASE = 'audit_test';

export async function testDatabase(): Promise<mysql.Pool> {
  const admin = await mysql.createConnection(auditDatabaseUrl());
  try {
    await admin.query(`create database if not exists ${TEST_DATABASE}`);
  } finally {
    await admin.end();
  }
  const url = new URL(auditDatabaseUrl());
  url.pathname = `/${TEST_DATABASE}`;
  const pool = openDatabase(url.toString());
  await resetDatabase(pool);
  return pool;
}
