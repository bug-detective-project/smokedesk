/** What the API tells the audit service about a change to a note. */
export interface AuditEvent {
  action: 'created' | 'deleted';
  noteId: number;
  text: string;
}

export type SendEvent = (event: AuditEvent) => Promise<void>;

/** Sends events to the audit service by HTTP, inside the workspace. */
export function auditClient(baseUrl: string): SendEvent {
  return async (event) => {
    const response = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error(`The audit service answered ${response.status}`);
    }
  };
}
