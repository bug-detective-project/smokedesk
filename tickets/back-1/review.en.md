# Code review: SD-201, a service only knows what it is told

Two services, two databases: the notes live in PostgreSQL behind the API, the history in MySQL behind the audit service. Neither reads the other's database. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The history is not derived from the notes: it is a separate record, and the audit service writes it only when the API posts an event.
- The creation route posted its event; the deletion route did not. Nothing failed: the API answered 204, the audit service answered every request it got. A missing call has no error to show.

## Why the reference fix is right

- The event is sent after the note is really deleted, and only when there was a note: a 404 tells the history nothing.
- It carries the note's text, which the audit service cannot look up later, because the note is gone.
- It goes through `tell`, like the creation: if the audit service is down the note is still deleted and the API logs the missed event. Losing a history line is better than refusing to delete.
- The regression test talks HTTP to a real server on its own port, so it checks the call between the services, not only a function.

## Compare with your fix

- Did you send the event before deleting? A delete that then fails leaves a "deleted" line for a note that is still there.
- Did you let the audit service read the notes table to find deletions? Each service owns its data; the API reports, the audit service records.
- Did you call `sendEvent` directly? A down audit service would then make the delete answer 500, although the note is gone.
