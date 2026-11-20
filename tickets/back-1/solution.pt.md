# Solução: a API conta as remoções ao serviço de auditoria também

**Causa.** `DELETE /api/notes/:id` em `server/src/app.ts` apaga o recado e responde 204 sem chamar `tell`, então o serviço de auditoria nunca fica sabendo da remoção. As criações funcionam porque `POST /api/notes` chama.

## Passo a passo

1. **Reproduza.** Apague **Badge for the new intern**: o painel continua só com criações, e o `curl http://localhost:3002/events` também.
2. **Siga a criação.** `POST /api/notes` chama `tell({ action: 'created', noteId, text })`, que envia ao `/events` do serviço de auditoria.
3. **Faça o mesmo depois de uma remoção**, só quando um recado foi apagado:

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

A referência também adiciona um teste de regressão, `server/src/notes-delete-audit.test.ts`: ele sobe um substituto do serviço de auditoria numa porta própria, apaga um recado pela API e confere o evento recebido; um recado que não existe não envia nada.

Depois rode `npm test`, apague um recado no balcão, olhe o painel e mova o cartão para **In QA**.
