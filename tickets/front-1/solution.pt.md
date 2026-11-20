# Solução: o painel pergunta onde está o serviço de auditoria

**Causa.** `auditUrl()` em `client/src/api/audit.ts` devolve `http://localhost:3002`, a porta que o projeto prefere. O app que roda o projeto publica cada porta numa livre e informa ao código o endereço em `VITE_AUDIT_URL`; o painel nunca lia essa variável.

## Passo a passo

1. **Reproduza.** Na aba Network, a requisição de `events` vai para `http://localhost:3002`, diga o que disser `echo $VITE_AUDIT_URL`.
2. **Ache o endereço.** O painel chama `listEvents()`, que monta `${auditUrl()}/events`.
3. **Leia a variável**, mantendo a porta preferida para quem roda fora do Bug Detective:

   ```ts
   /**
    * Where the audit service answers on the player's computer. The browser calls it directly, so the
    * address is the port the app that runs the project chose, which it gives in VITE_AUDIT_URL.
    */
   export function auditUrl(): string {
     return import.meta.env.VITE_AUDIT_URL || 'http://localhost:3002';
   }
   ```

A referência também adiciona um teste de regressão, `client/src/activity-address.test.ts`: com `VITE_AUDIT_URL` definida, o histórico é lido dela; sem ela, da porta 3002.

Depois rode `npm test`, reinicie o `npm run dev`, confira a aba Network de novo e mova o cartão para **In QA**.
