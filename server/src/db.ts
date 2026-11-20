import pg from 'pg';

export interface Note {
  id: number;
  text: string;
  createdAt: string;
}

/** The notes of a fresh desk. */
export const SAMPLE_NOTES = ['Call the printer company about the toner', 'Badge for the new intern', 'Fire drill on Friday at 10'];

export function openDatabase(url: string): pg.Pool {
  return new pg.Pool({ connectionString: url, max: 5 });
}

/** Whether the notes table exists: the first start on a new database creates it. */
export async function isInitialized(pool: pg.Pool): Promise<boolean> {
  const { rows } = await pool.query('select to_regclass(\'public.notes\') as found');
  return rows[0]?.found !== null;
}

/** Empties the database and puts the sample notes back. */
export async function resetDatabase(pool: pg.Pool): Promise<void> {
  await pool.query('drop table if exists notes');
  await pool.query('create table notes (id serial primary key, text varchar(200) not null, created_at timestamptz not null default now())');
  for (const text of SAMPLE_NOTES) {
    await pool.query('insert into notes (text) values ($1)', [text]);
  }
}

const toNote = (row: { id: number; text: string; created_at: Date }): Note => ({ id: row.id, text: row.text, createdAt: row.created_at.toISOString() });

export async function listNotes(pool: pg.Pool): Promise<Note[]> {
  const { rows } = await pool.query('select id, text, created_at from notes order by id');
  return rows.map(toNote);
}

export async function createNote(pool: pg.Pool, text: string): Promise<Note> {
  const { rows } = await pool.query('insert into notes (text) values ($1) returning id, text, created_at', [text]);
  return toNote(rows[0]);
}

/** The note that was deleted, or null when there was none with that id. */
export async function deleteNote(pool: pg.Pool, id: number): Promise<Note | null> {
  const { rows } = await pool.query('delete from notes where id = $1 returning id, text, created_at', [id]);
  return rows[0] ? toNote(rows[0]) : null;
}
