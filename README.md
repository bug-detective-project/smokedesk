# Smoke Desk

The front desk notes of a small office: the shift writes notes, deletes them, and an Activity panel
shows the history. It is the project the [Bug Detective](https://github.com/bug-detective-project)
app plays in its own tests: two tickets (one front, one back), two services that talk to each
other, two databases and three ports. This branch (`main`) is the app with every bug fixed; the
tickets are built from it (see the `qa` branch).

| Part      | Stack                                             | Port   |
| --------- | ------------------------------------------------- | ------ |
| `client/` | React, Vite, CSS Modules, Inter                   | `5173` |
| `server/` | The API: Node.js, Express 5, `pg`, PostgreSQL 17  | `3001` |
| `audit/`  | The audit service: Express 5, `mysql2`, MySQL 8.4 | `3002` |

## Running it

Each service reads the address of its database from a variable; nothing in the code knows a fixed
address. Inside Bug Detective both databases are already there: the app starts them next to your
workspace and sets the variables.

```sh
npm ci
npm run db:reset   # create both databases' tables and the samples
npm run dev        # the desk on http://localhost:5173, the API on 3001, the audit service on 3002
```

Outside Bug Detective, start a PostgreSQL 17 and a MySQL 8.4 yourself and set the variables
(`services.json` has the settings the game uses):

| Variable             | Read by | Example                                              |
| -------------------- | ------- | ---------------------------------------------------- |
| `NOTES_DATABASE_URL` | API     | `postgres://postgres:smokedesk@localhost:5432/notes` |
| `AUDIT_DATABASE_URL` | audit   | `mysql://root:smokedesk@localhost:3306/audit`        |

| Command                                   | What it does                                                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | Starts the client, the API and the audit service, all reloading on change                                        |
| `npm run db:reset`                        | Empties both databases and puts the samples back                                                                 |
| `npm test`                                | Runs every test (each service tests on a database of its own, `notes_test` and `audit_test`, on the same server) |
| `npm run lint` / `npm run lint:fix`       | ESLint, which also formats the TypeScript files                                                                  |
| `npm run format` / `npm run format:check` | Prettier, for every other file                                                                                   |

## The ports

Bug Detective publishes each of the three ports on your computer, on a free port each: the one the
project prefers when it is free, another one when not. The code that has to know the port it got
reads it from a variable the app fills:

| Variable             | Read by          | What it holds                                                                                  |
| -------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `VITE_AUDIT_URL`     | client (browser) | Where the browser reaches the audit service, `http://localhost:<port of audit>`                |
| `CLIENT_ORIGIN`      | audit            | The page allowed to read the history (CORS), `http://localhost:<port of client>`               |
| `AUDIT_INTERNAL_URL` | API              | Where the API reaches the audit service inside the workspace (default `http://localhost:3002`) |

Without them the code falls back to the preferred ports, which is what `npm run dev` on your own
computer uses.

## Looking at the data

The PostgreSQL is in `NOTES_DATABASE_URL` and the MySQL in `AUDIT_DATABASE_URL`; the MySQL client
also finds its server through `MYSQL_HOST` and `MYSQL_TCP_PORT`, which Bug Detective sets too. In
VS Code, the SQLTools extension and its PostgreSQL and MySQL drivers (recommended by this project)
connect to the same addresses.

## How it is organized

- **The API** (`server/src/app.ts`) keeps the notes in PostgreSQL. On every creation and removal it
  tells the audit service by HTTP (`server/src/audit-client.ts`). A note is saved even when the
  audit service does not answer; the API logs the missed event.
- **The audit service** (`audit/src/app.ts`) keeps the events in MySQL and lists them newest first.
  The browser reads them directly, so it answers with a CORS header only to `CLIENT_ORIGIN`.
- **The client** reads the notes from the API through Vite's proxy (`/api`) and the history straight
  from the audit service (`client/src/api/audit.ts`). After each change it reads the history again.
- **Both services** answer only `localhost`, `127.0.0.1` and `[::1]`.

## License

[PolyForm Noncommercial 1.0.0](LICENSE).
