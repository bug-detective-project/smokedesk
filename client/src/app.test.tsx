import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';
import { fakeBackend } from './test/fake-backend.ts';

const notes = [
  { id: 1, text: 'Call the printer company about the toner', createdAt: '2026-11-20T09:00:00.000Z' },
  { id: 2, text: 'Badge for the new intern', createdAt: '2026-11-20T09:05:00.000Z' },
];
const events = [
  { id: 2, action: 'created' as const, noteId: 2, text: 'Badge for the new intern', at: '2026-11-20T09:05:00.000Z' },
  { id: 1, action: 'created' as const, noteId: 1, text: 'Call the printer company about the toner', at: '2026-11-20T09:00:00.000Z' },
];

describe('the desk', () => {
  it('lists the notes', async () => {
    fakeBackend(notes, events);
    render(<App />);

    const list = await screen.findByRole('list', { name: 'Notes' });
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('Call the printer company about the toner'),
      expect.stringContaining('Badge for the new intern'),
    ]);
  });

  it('writes a note, and the activity shows it', async () => {
    fakeBackend(notes, events);
    render(<App />);
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('New note'), 'Order more coffee');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(await screen.findByText('Order more coffee', { selector: 'p' })).toBeInTheDocument();
    const activity = screen.getByRole('list', { name: 'Activity' });
    await waitFor(() => expect(within(activity).getAllByRole('listitem')[0]).toHaveTextContent('CreatedOrder more coffee'));
    expect(screen.getByLabelText('New note')).toHaveValue('');
  });

  it('does not send an empty note', async () => {
    const backend = fakeBackend(notes, events);
    render(<App />);
    const user = userEvent.setup();

    await user.type(await screen.findByLabelText('New note'), '   ');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(backend.calls.filter((call) => call.startsWith('POST'))).toEqual([]);
  });

  it('deletes a note', async () => {
    fakeBackend(notes, events);
    render(<App />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Delete “Badge for the new intern”' }));

    expect(screen.queryByText('Badge for the new intern', { selector: 'p' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Notes' })).getAllByRole('listitem')).toHaveLength(1);
  });

  it('lists the history of the audit service, newest first', async () => {
    fakeBackend(notes, events);
    render(<App />);

    const activity = await screen.findByRole('list', { name: 'Activity' });
    await within(activity).findAllByRole('listitem');
    expect(within(activity).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('Badge for the new intern'),
      expect.stringContaining('Call the printer company about the toner'),
    ]);
  });

  it('says so when the audit service does not answer', async () => {
    const backend = fakeBackend(notes, events);
    const real = globalThis.fetch;
    globalThis.fetch = (async (input: string, init?: RequestInit) =>
      input.endsWith('/events') ? Promise.reject(new TypeError('Failed to fetch')) : real(input, init)) as typeof fetch;
    render(<App />);

    expect(await screen.findByText('The audit service is not answering.')).toBeInTheDocument();
    expect(backend.calls).toContain('GET /api/notes');
  });
});
