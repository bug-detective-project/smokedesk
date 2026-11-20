import { request } from './http.ts';

export interface AuditEvent {
  id: number;
  action: 'created' | 'deleted';
  noteId: number;
  text: string;
  at: string;
}

/** Where the audit service answers. */
export function auditUrl(): string {
  return 'http://localhost:3002';
}

export const listEvents = () => request<AuditEvent[]>(`${auditUrl()}/events`);
