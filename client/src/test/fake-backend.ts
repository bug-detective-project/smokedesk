import { vi } from 'vitest';

export interface FakeNote {
  id: number;
  text: string;
  createdAt: string;
}

export interface FakeEvent {
  id: number;
  action: 'created' | 'deleted';
  noteId: number;
  text: string;
  at: string;
}

/**
 * A stand-in for the API and the audit service behind `fetch`: notes under /api/notes, the history
 * under <any origin>/events. A change to a note adds its event, as the real API does.
 */
export function fakeBackend(notes: FakeNote[], events: FakeEvent[] = []) {
  const state = { notes: [...notes], events: [...events], calls: [] as string[] };
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const record = (action: FakeEvent['action'], note: FakeNote) =>
    state.events.unshift({ id: state.events.length + 1, action, noteId: note.id, text: note.text, at: '2026-11-20T12:00:00.000Z' });

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init: RequestInit = {}) => {
      const method = init.method ?? 'GET';
      state.calls.push(`${method} ${input}`);
      if (input.endsWith('/events')) {
        return json(state.events);
      }
      if (input === '/api/notes' && method === 'GET') {
        return json(state.notes);
      }
      if (input === '/api/notes' && method === 'POST') {
        const { text } = JSON.parse(String(init.body)) as { text: string };
        const note = { id: Math.max(0, ...state.notes.map((n) => n.id)) + 1, text, createdAt: '2026-11-20T12:00:00.000Z' };
        state.notes.push(note);
        record('created', note);
        return json(note, 201);
      }
      const removed = /^\/api\/notes\/(\d+)$/.exec(input);
      if (removed && method === 'DELETE') {
        const note = state.notes.find((n) => n.id === Number(removed[1]));
        if (!note) {
          return json({ error: 'There is no such note' }, 404);
        }
        state.notes = state.notes.filter((n) => n !== note);
        record('deleted', note);
        return new Response(null, { status: 204 });
      }
      return json({ error: 'Not found' }, 404);
    }),
  );
  return state;
}
