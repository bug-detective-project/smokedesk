import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import styles from './App.module.css';
import { createNote, deleteNote, listNotes } from './api/notes.ts';
import type { Note } from './api/notes.ts';

export function NotesPanel({ onChange }: { onChange: () => void }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listNotes().then(setNotes, (reason: Error) => setError(reason.message));
  }, []);

  async function add(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }
    try {
      const note = await createNote(text);
      setNotes((current) => [...(current ?? []), note]);
      setDraft('');
      setError(null);
      onChange();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  async function remove(note: Note) {
    try {
      await deleteNote(note.id);
      setNotes((current) => (current ?? []).filter((other) => other.id !== note.id));
      setError(null);
      onChange();
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  return (
    <section className={styles.card} aria-labelledby="notes-title">
      <h2 id="notes-title" className={styles.cardTitle}>
        Notes
      </h2>
      <form className={styles.form} onSubmit={add}>
        <label htmlFor="new-note" className={styles.label}>
          New note
        </label>
        <div className={styles.formRow}>
          <input
            id="new-note"
            className={styles.input}
            value={draft}
            maxLength={200}
            placeholder="What should the next shift know?"
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className={styles.primary}>
            Add note
          </button>
        </div>
      </form>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {notes === null ? (
        <p className={styles.muted}>Loading notes…</p>
      ) : notes.length === 0
        ? (
            <p className={styles.muted}>No notes yet.</p>
          )
        : (
            <ul aria-label="Notes" className={styles.notes}>
              {notes.map((note) => (
                <li key={note.id} className={styles.note}>
                  <p className={styles.noteText}>{note.text}</p>
                  <button
                    type="button"
                    className={styles.ghost}
                    aria-label={`Delete “${note.text}”`}
                    onClick={() => void remove(note)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
    </section>
  );
}
