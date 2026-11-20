import { expect, test } from '@playwright/test';
import { SAMPLE_NOTES, activity, auditUrl, openDesk } from '../../../support/app.ts';

test.describe('Ticket front-1: the Activity panel finds the audit service on the port it was given', () => {
  test('the panel shows the history of the audit service, which is not on its preferred port', async ({ page }) => {
    expect(new URL(auditUrl()).port, 'the QA never runs the audit service on 3002').not.toBe('3002');
    await openDesk(page);

    await expect(activity(page).getByRole('listitem')).toHaveCount(SAMPLE_NOTES.length);
    await expect(activity(page).getByRole('listitem').first()).toContainText(SAMPLE_NOTES[2]);
    await expect(page.getByText('The audit service is not answering.')).toHaveCount(0);
  });

  test('a note written on the desk shows up in the panel', async ({ page }) => {
    await openDesk(page);
    await expect(activity(page).getByRole('listitem')).toHaveCount(SAMPLE_NOTES.length);

    await page.getByLabel('New note').fill('Water the plants on Monday');
    await page.getByRole('button', { name: 'Add note' }).click();

    await expect(activity(page).getByRole('listitem').first()).toContainText('Water the plants on Monday');
  });
});
