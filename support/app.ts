import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

/**
 * What every Gate 2 spec knows about the app: the sample desk of `npm run db:reset` and the pages
 * the specs share. The QA serves the client on a free port, never on the preferred ones, and the
 * audit service on another (QA_AUDIT_URL).
 */
export const SAMPLE_NOTES = [
  'Call the printer company about the toner',
  'Badge for the new intern',
  'Fire drill on Friday at 10',
] as const;

/** Where the audit service of this run answers. */
export function auditUrl(): string {
  const url = process.env.QA_AUDIT_URL;
  if (!url) {
    throw new Error('QA_AUDIT_URL is not set. Run the suite through `npm run qa`.');
  }
  return url;
}

/** Opens the desk and waits for its notes. */
export async function openDesk(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('list', { name: 'Notes' })).toBeVisible();
}

/** The Activity panel's list of events. */
export function activity(page: Page): Locator {
  return page.getByRole('list', { name: 'Activity' });
}
