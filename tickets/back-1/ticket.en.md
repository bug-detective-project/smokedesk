# SD-201: Deleted notes never show up in the Activity panel

| Field | Value |
| --- | --- |
| Project | Smoke Desk (SD) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Nora Bell (Front desk lead) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (notes) |
| Labels | `api`, `audit`, `services` |
| Sprint | SD Sprint 1 |
| Created | Nov 17, 2026 08:50 |

## Description

This morning the note about the fire drill was gone, and nobody knew who had deleted it or when. I opened the Activity panel to find out: it shows when each note was **created**, and nothing about any note being **deleted**. I deleted a test note myself and watched the panel: the note left the list, and the panel stayed the same.

We started keeping the history so that a note never disappears without a trace.

## Steps to reproduce

1. Open the desk.
2. Click **Delete** on **Badge for the new intern**.
3. Look at the Activity panel.

Or, in the VS Code terminal, with the app running:

```sh
curl -X DELETE http://localhost:3001/api/notes/2
curl http://localhost:3002/events
```

## Expected result

The panel shows a **Deleted** event for **Badge for the new intern** at the top, and `GET /events` has `{ "action": "deleted", "noteId": 2, ... }` first.

## Actual result

The note is gone, and the history has only the creations.

## Acceptance criteria

- [ ] Deleting a note sends a `deleted` event to the audit service, with the note's id and text.
- [ ] Deleting a note that does not exist answers 404 and sends nothing.
- [ ] A note is deleted even when the audit service does not answer, as a new note is saved.

## Environment

- Smoke Desk 1.0
- Any browser; also with curl

## Activity

**Sam Ortiz** · Nov 17, 2026 09:30
> The audit service is the one with MySQL, next to the API. It only knows what the API tells it.
