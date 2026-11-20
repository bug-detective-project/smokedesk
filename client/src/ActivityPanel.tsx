import styles from './App.module.css';
import type { AuditEvent } from './api/audit.ts';

const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' });

export function ActivityPanel({ events, unavailable }: { events: AuditEvent[] | null; unavailable: boolean }) {
  return (
    <section className={styles.card} aria-labelledby="activity-title">
      <h2 id="activity-title" className={styles.cardTitle}>
        Activity
      </h2>
      {unavailable ? (
        <p role="alert" className={styles.error}>
          The audit service is not answering.
        </p>
      ) : events === null
        ? (
            <p className={styles.muted}>Loading activity…</p>
          )
        : events.length === 0
          ? (
              <p className={styles.muted}>Nothing happened yet.</p>
            )
          : (
              <ul aria-label="Activity" className={styles.events}>
                {events.map((event) => (
                  <li key={event.id} className={styles.event}>
                    <span className={event.action === 'created' ? styles.created : styles.deleted}>
                      {event.action === 'created' ? 'Created' : 'Deleted'}
                    </span>
                    <span className={styles.eventText}>{event.text}</span>
                    <time className={styles.muted} dateTime={event.at}>
                      {time.format(new Date(event.at))}
                    </time>
                  </li>
                ))}
              </ul>
            )}
    </section>
  );
}
