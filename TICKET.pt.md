# SD-101: O painel Activity fica vazio no computador do Sam

| Campo | Valor |
| --- | --- |
| Projeto | Smoke Desk (SD) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Alta |
| Relator | Sam Ortiz (Técnico de TI terceirizado) |
| Trilha | Front-end |
| Versão afetada | 1.0 |
| Componente | Cliente (painel Activity) |
| Rótulos | `cliente`, `configuração`, `portas` |
| Sprint | SD Sprint 1 |
| Criado em | 16/11/2026 10:05 |

## Descrição

No meu computador o painel Activity nunca mostra nada: aparece "The audit service is not answering." Os recados funcionam, e o serviço de auditoria está no ar: o Dashboard mostra a porta dele, e o `curl` pega o histórico lá.

A porta 3002 está ocupada no meu computador por outra ferramenta, então o serviço de auditoria ganhou outra porta. O app informa ao código qual é em `VITE_AUDIT_URL`. No computador da Nora a 3002 está livre e o painel funciona.

## Passos para reproduzir

1. No terminal do VS Code, rode `npm run dev` e abra o balcão com **Open app in browser**.
2. Abra as ferramentas de desenvolvedor do navegador, aba **Network**, e recarregue.
3. Veja a requisição de `events` e compare o endereço dela com `echo $VITE_AUDIT_URL` no terminal.

## Resultado esperado

O painel lê o histórico do endereço que está em `VITE_AUDIT_URL`, seja qual for a porta.

## Resultado atual

O painel sempre chama `http://localhost:3002/events`. Só funciona onde o serviço de auditoria ganhou a 3002.

## Critérios de aceite

- [ ] O painel Activity lê o histórico de `VITE_AUDIT_URL`.
- [ ] Sem `VITE_AUDIT_URL` (rodando o projeto fora do Bug Detective), continua usando `http://localhost:3002`.

## Ambiente

- Smoke Desk 1.0
- Qualquer navegador

## Atividade

**Nora Bell** · 16/11/2026 10:40
> Aqui funciona. Será o computador do Sam?
