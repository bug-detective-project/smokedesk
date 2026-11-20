import { request } from './http.ts';

export interface Note {
  id: number;
  text: string;
  createdAt: string;
}

/** The API answers through the dev server's proxy, on the client's own origin. */
export const listNotes = () => request<Note[]>('/api/notes');
export const createNote = (text: string) => request<Note>('/api/notes', { method: 'POST', body: { text } });
export const deleteNote = (id: number) => request<void>(`/api/notes/${id}`, { method: 'DELETE' });
