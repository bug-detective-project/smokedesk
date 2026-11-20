# SD-101: The Activity panel is empty on Sam's computer

| Field | Value |
| --- | --- |
| Project | Smoke Desk (SD) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Sam Ortiz (IT contractor) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Client (Activity panel) |
| Labels | `client`, `configuration`, `ports` |
| Sprint | SD Sprint 1 |
| Created | Nov 16, 2026 10:05 |

## Description

On my computer the Activity panel never shows anything: it says "The audit service is not answering." The notes work, and the audit service is up: the Dashboard shows it on its port, and `curl` gets the history from there.

Port 3002 is taken on my computer by another tool, so the audit service got another port. The app tells the code which one in `VITE_AUDIT_URL`. On Nora's computer 3002 is free and the panel works.

## Steps to reproduce

1. In the VS Code terminal, run `npm run dev` and open the desk with **Open app in browser**.
2. Open the browser's developer tools, **Network** tab, and reload.
3. Look at the request for `events`, and compare its address with `echo $VITE_AUDIT_URL` in the terminal.

## Expected result

The panel reads the history from the address in `VITE_AUDIT_URL`, whatever port it has.

## Actual result

The panel always calls `http://localhost:3002/events`. It works only where the audit service got 3002.

## Acceptance criteria

- [ ] The Activity panel reads the history from `VITE_AUDIT_URL`.
- [ ] Without `VITE_AUDIT_URL` (running the project outside Bug Detective), it still uses `http://localhost:3002`.

## Environment

- Smoke Desk 1.0
- Any browser

## Activity

**Nora Bell** · Nov 16, 2026 10:40
> Works here. Could it be Sam's computer?
