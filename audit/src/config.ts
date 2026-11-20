export const port = Number(process.env.PORT ?? 3002);

/** The audit database: the app that plays this project starts a MySQL and sets the variable. */
export function auditDatabaseUrl(env: Record<string, string | undefined> = process.env): string {
  const url = env.AUDIT_DATABASE_URL;
  if (!url) {
    throw new Error('AUDIT_DATABASE_URL is not set: the audit service needs the address of its MySQL database');
  }
  return url;
}

/** The page allowed to read the history from the browser: the client, on the port it was given. */
export function clientOrigin(env: Record<string, string | undefined> = process.env): string {
  return env.CLIENT_ORIGIN ?? 'http://localhost:5173';
}
