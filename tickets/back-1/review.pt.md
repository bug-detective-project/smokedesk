# Revisão de código: SD-201, um serviço só sabe o que lhe contam

Dois serviços, dois bancos: os recados vivem no PostgreSQL atrás da API, o histórico no MySQL atrás do serviço de auditoria. Nenhum lê o banco do outro. Esta é a abordagem da referência, para você comparar com a sua.

## Por que o bug aconteceu

- O histórico não é calculado a partir dos recados: é um registro separado, e o serviço de auditoria só escreve quando a API envia um evento.
- A rota de criação enviava o evento; a de remoção não. Nada falhou: a API respondeu 204, o serviço de auditoria respondeu a cada requisição que recebeu. Uma chamada que falta não tem erro para mostrar.

## Por que a correção da referência está certa

- O evento é enviado depois que o recado foi de fato apagado, e só quando havia um recado: um 404 não conta nada ao histórico.
- Leva o texto do recado, que o serviço de auditoria não consegue buscar depois, porque o recado já não existe.
- Passa por `tell`, como a criação: se o serviço de auditoria está fora do ar o recado é apagado assim mesmo e a API registra o evento perdido. Perder uma linha do histórico é melhor do que se recusar a apagar.
- O teste de regressão fala HTTP com um servidor de verdade numa porta própria, então confere a chamada entre os serviços, não só uma função.

## Compare com a sua correção

- Enviou o evento antes de apagar? Uma remoção que depois falha deixa uma linha "deleted" de um recado que continua lá.
- Deixou o serviço de auditoria ler a tabela de recados para achar as remoções? Cada serviço é dono dos seus dados; a API conta, o serviço de auditoria registra.
- Chamou `sendEvent` direto? Com o serviço de auditoria fora do ar a remoção responderia 500, embora o recado tenha sumido.
