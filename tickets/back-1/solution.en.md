# Solution: the API tells the audit service about deletions too

**Root cause.** `DELETE /api/notes/:id` in `server/src/app.ts` deletes the note and answers 204 without calling `tell`, so the audit service never hears about the removal. Creations work because `POST /api/notes` calls it.

## Step by step

1. **Reproduce it.** Delete **Badge for the new intern**: the panel keeps only creations, and `curl http://localhost:3002/events` too.
2. **Follow the creation.** `POST /api/notes` calls `tell({ action: 'created', noteId, text })`, which posts to the audit service's `/events`.
3. **Do the same after a deletion**, only when a note was deleted:

   ```ts
   app.delete('/api/notes/:id', async (req, res) => {
     const note = await deleteNote(pool, Number(req.params.id) || 0);
     if (!note) {
       res.status(404).json({ error: 'There is no such note' });
       return;
     }
     await tell({ action: 'deleted', noteId: note.id, text: note.text });
     res.status(204).end();
   });
   ```

The reference also adds a regression test, `server/src/notes-delete-audit.test.ts`: it starts a stand-in for the audit service on a port of its own, deletes a note through the API and checks the event it received; a note that does not exist sends nothing.

Then run `npm test`, delete a note on the desk, watch the panel and move the card to **In QA**.
