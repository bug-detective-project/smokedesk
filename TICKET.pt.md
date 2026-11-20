# SD-201: Recados apagados nunca aparecem no painel Activity

| Campo | Valor |
| --- | --- |
| Projeto | Smoke Desk (SD) |
| Tipo de item | Bug |
| Status | A fazer |
| Prioridade | Média |
| Relator | Nora Bell (Responsável pela recepção) |
| Trilha | Back-end |
| Versão afetada | 1.0 |
| Componente | API (recados) |
| Rótulos | `api`, `auditoria`, `serviços` |
| Sprint | SD Sprint 1 |
| Criado em | 17/11/2026 08:50 |

## Descrição

Hoje de manhã o recado do simulado de incêndio tinha sumido, e ninguém sabia quem o apagou nem quando. Abri o painel Activity para descobrir: ele mostra quando cada recado foi **criado**, e nada sobre recado **apagado**. Apaguei um recado de teste e fiquei olhando o painel: o recado saiu da lista, e o painel continuou igual.

Começamos a guardar o histórico justamente para nenhum recado sumir sem deixar rastro.

## Passos para reproduzir

1. Abra o balcão.
2. Clique em **Delete** em **Badge for the new intern**.
3. Olhe o painel Activity.

Ou, no terminal do VS Code, com o app rodando:

```sh
curl -X DELETE http://localhost:3001/api/notes/2
curl http://localhost:3002/events
```

## Resultado esperado

O painel mostra no topo um evento **Deleted** de **Badge for the new intern**, e o `GET /events` traz `{ "action": "deleted", "noteId": 2, ... }` primeiro.

## Resultado atual

O recado some, e o histórico só tem as criações.

## Critérios de aceite

- [ ] Apagar um recado envia um evento `deleted` ao serviço de auditoria, com o id e o texto do recado.
- [ ] Apagar um recado que não existe responde 404 e não envia nada.
- [ ] O recado é apagado mesmo quando o serviço de auditoria não responde, como um recado novo é salvo.

## Ambiente

- Smoke Desk 1.0
- Qualquer navegador; também com curl

## Atividade

**Sam Ortiz** · 17/11/2026 09:30
> O serviço de auditoria é o do MySQL, ao lado da API. Ele só sabe o que a API conta.
