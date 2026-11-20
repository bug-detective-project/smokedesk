import { expect, test } from '@playwright/test';
import { SAMPLE_NOTES, activity, auditUrl, openDesk } from '../../../support/app.ts';

interface AuditEvent {
  action: string;
  noteId: number;
  text: string;
}

test.describe('Ticket back-1: the audit service hears about every deleted note', () => {
  test('deleting a note on the desk puts the removal in the Activity panel', async ({ page }) => {
    await openDesk(page);
    await expect(activity(page).getByRole('listitem')).toHaveCount(SAMPLE_NOTES.length);

    await page.getByRole('button', { name: `Delete “${SAMPLE_NOTES[1]}”` }).click();

    await expect(page.getByRole('list', { name: 'Notes' }).getByText(SAMPLE_NOTES[1])).toHaveCount(0);
    const latest = activity(page).getByRole('listitem').first();
    await expect(latest).toContainText('Deleted');
    await expect(latest).toContainText(SAMPLE_NOTES[1]);
  });

  test('the API reports the removal to the audit service', async ({ request }) => {
    const created = await request.post('/api/notes', { data: { text: 'Lost and found box is full' } });
    expect(created.status()).toBe(201);
    const { id } = (await created.json()) as { id: number };

    expect((await request.delete(`/api/notes/${id}`)).status()).toBe(204);

    const events = (await (await request.get(`${auditUrl()}/events`)).json()) as AuditEvent[];
    expect(events[0]).toEqual(expect.objectContaining({ action: 'deleted', noteId: id, text: 'Lost and found box is full' }));
  });
});
