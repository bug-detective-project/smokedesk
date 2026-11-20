import { request } from './http.ts';

export interface AuditEvent {
  id: number;
  action: 'created' | 'deleted';
  noteId: number;
  text: string;
  at: string;
}

/**
 * Where the audit service answers on the player's computer. The browser calls it directly, so the
 * address is the port the app that runs the project chose, which it gives in VITE_AUDIT_URL.
 */
export function auditUrl(): string {
  return import.meta.env.VITE_AUDIT_URL || 'http://localhost:3002';
}

export const listEvents = () => request<AuditEvent[]>(`${auditUrl()}/events`);
