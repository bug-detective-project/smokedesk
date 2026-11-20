export const port = Number(process.env.PORT ?? 3001);

/** The notes database: the app that plays this project starts a PostgreSQL and sets the variable. */
export function notesDatabaseUrl(env: Record<string, string | undefined> = process.env): string {
  const url = env.NOTES_DATABASE_URL;
  if (!url) {
    throw new Error('NOTES_DATABASE_URL is not set: the API needs the address of its PostgreSQL database');
  }
  return url;
}

/** Where the audit service answers inside the workspace; the API calls it on every change. */
export function auditInternalUrl(env: Record<string, string | undefined> = process.env): string {
  return env.AUDIT_INTERNAL_URL ?? 'http://localhost:3002';
}
