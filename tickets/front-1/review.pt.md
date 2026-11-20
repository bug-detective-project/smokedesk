# Revisão de código: SD-101, uma porta preferida não é um endereço

O bug só aparecia num computador com a 3002 ocupada, por isso "aqui funciona". Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- O projeto declara as portas que prefere: o cliente na 5173, a API na 3001, o serviço de auditoria na 3002. No computador do jogador, o app publica cada uma numa porta livre: a preferida quando está livre, outra quando não.
- Os recados nunca perceberam: o navegador chama a API na própria origem da página (`/api`), e o proxy do Vite repassa.
- O histórico é diferente: o navegador chama o serviço de auditoria direto, então o código precisa saber a porta que ele ganhou. O app escreve essa porta em `VITE_AUDIT_URL`, e o painel a ignorava.

## Por que a correção da referência está certa

- Lê o endereço do ambiente, o único lugar que o conhece, e mantém a porta preferida só como alternativa para quem roda fora do Bug Detective.
- `VITE_` é o prefixo que o Vite expõe ao código do navegador. O que não tem o prefixo fica do lado do servidor, que é o que você quer para segredos.
- O teste de regressão confere os dois caminhos: com a variável e sem ela.

## Compare com a sua correção

- Trocou `3002` pela porta que viu no Dashboard? Funciona no seu computador hoje e quebra no próximo.
- Leu `process.env.VITE_AUDIT_URL`? Não existe `process` no navegador; o Vite substitui `import.meta.env.*`.
- Usou `??` em vez de `||`? Uma variável vazia daria um endereço vazio.
