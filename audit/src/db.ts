import mysql from 'mysql2/promise';

export type Action = 'created' | 'deleted';

export interface AuditEvent {
  id: number;
  action: Action;
  noteId: number;
  text: string;
  at: string;
}

/** The history of a fresh desk: the creation of the API's three sample notes. */
const SAMPLE_EVENTS: [Action, number, string][] = [
  ['created', 1, 'Call the printer company about the toner'],
  ['created', 2, 'Badge for the new intern'],
  ['created', 3, 'Fire drill on Friday at 10'],
];

export function openDatabase(url: string): mysql.Pool {
  return mysql.createPool({ uri: url, connectionLimit: 5, timezone: 'Z' });
}

export async function isInitialized(pool: mysql.Pool): Promise<boolean> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('show tables like \'events\'');
  return rows.length > 0;
}

/** Empties the database and puts the sample history back. */
export async function resetDatabase(pool: mysql.Pool): Promise<void> {
  await pool.query('drop table if exists events');
  await pool.query(
    'create table events (id int auto_increment primary key, action enum(\'created\', \'deleted\') not null, note_id int not null, text varchar(200) not null, at datetime(3) not null default current_timestamp(3))',
  );
  for (const [action, noteId, text] of SAMPLE_EVENTS) {
    await pool.query('insert into events (action, note_id, text) values (?, ?, ?)', [action, noteId, text]);
  }
}

/** The latest events, newest first. */
export async function listEvents(pool: mysql.Pool, limit = 50): Promise<AuditEvent[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'select id, action, note_id, text, at from events order by id desc limit ?',
    [limit],
  );
  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    noteId: row.note_id,
    text: row.text,
    at: (row.at as Date).toISOString(),
  }));
}

export async function addEvent(pool: mysql.Pool, event: { action: Action; noteId: number; text: string }): Promise<void> {
  await pool.query('insert into events (action, note_id, text) values (?, ?, ?)', [event.action, event.noteId, event.text]);
}
