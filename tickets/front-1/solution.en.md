# Solution: the panel asks where the audit service is

**Root cause.** `auditUrl()` in `client/src/api/audit.ts` returns `http://localhost:3002`, the port the project prefers. The app that runs the project publishes each port on a free one and tells the code the address in `VITE_AUDIT_URL`; the panel never read it.

## Step by step

1. **Reproduce it.** In the Network tab, the request for `events` goes to `http://localhost:3002`, whatever `echo $VITE_AUDIT_URL` says.
2. **Find the address.** The panel calls `listEvents()`, which builds `${auditUrl()}/events`.
3. **Read the variable**, keeping the preferred port for runs outside Bug Detective:

   ```ts
   /**
    * Where the audit service answers on the player's computer. The browser calls it directly, so the
    * address is the port the app that runs the project chose, which it gives in VITE_AUDIT_URL.
    */
   export function auditUrl(): string {
     return import.meta.env.VITE_AUDIT_URL || 'http://localhost:3002';
   }
   ```

The reference also adds a regression test, `client/src/activity-address.test.ts`: with `VITE_AUDIT_URL` set, the history is read from it; without it, from port 3002.

Then run `npm test`, restart `npm run dev`, check the Network tab again and move the card to **In QA**.
