import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { ActivityPanel } from './ActivityPanel.tsx';
import { NotesPanel } from './NotesPanel.tsx';
import { listEvents } from './api/audit.ts';
import type { AuditEvent } from './api/audit.ts';

export function App() {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [auditDown, setAuditDown] = useState(false);

  // Each change to a note counts up, and the history is read again.
  const [changes, setChanges] = useState(0);

  useEffect(() => {
    let current = true;
    listEvents().then(
      (found) => {
        if (current) {
          setEvents(found);
          setAuditDown(false);
        }
      },
      () => {
        if (current) {
          setAuditDown(true);
        }
      },
    );
    return () => {
      current = false;
    };
  }, [changes]);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            S
          </span>
          Smoke Desk
        </div>
        <p className={styles.tagline}>Front desk notes</p>
      </header>
      <main className={styles.main}>
        <NotesPanel onChange={() => setChanges((count) => count + 1)} />
        <ActivityPanel events={events} unavailable={auditDown} />
      </main>
    </div>
  );
}
