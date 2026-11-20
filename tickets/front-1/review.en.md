# Code review: SD-101, a preferred port is not an address

The bug only showed on a computer where 3002 was taken, which is why it "worked here". Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The project declares the ports it prefers: the client on 5173, the API on 3001, the audit service on 3002. On the player's computer, the app publishes each one on a free port: the preferred one when it is free, another one when not.
- The notes never noticed: the browser calls the API on the page's own origin (`/api`), and Vite's proxy forwards it.
- The history is different: the browser calls the audit service directly, so the code has to know the port it got. The app writes it in `VITE_AUDIT_URL`, and the panel ignored it.

## Why the reference fix is right

- It reads the address from the environment, the one place that knows it, and keeps the preferred port only as the fallback for a run outside Bug Detective.
- `VITE_` is the prefix Vite exposes to the browser code. Anything without it stays on the server side, which is what you want for secrets.
- The regression test checks both branches: with the variable and without it.

## Compare with your fix

- Did you change `3002` to the port you saw on the Dashboard? It works on your computer today and breaks on the next one.
- Did you read `process.env.VITE_AUDIT_URL`? There is no `process` in the browser; Vite replaces `import.meta.env.*`.
- Did you use `??` instead of `||`? An empty variable would then give an empty address.
