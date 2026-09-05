# Etapa 39F.13 — Capacidade e escalabilidade do BetAnalytics

## Status

**Etapa 39F.13 encerrada.**

Data de fechamento: 2026-09-05.

Os testes principais desta etapa foram executados em produção no backend
BetAnalytics hospedado no Render.

Este documento registra o envelope de capacidade comprovado no ambiente atual
sem ativar novas instâncias pagas, autoscaling ou worker dedicado.

---

## 1. Objetivo

A Etapa 39F.13 teve como objetivo revalidar a capacidade real do frontend e do
backend após as melhorias estruturais realizadas na Etapa 39F, incluindo:

- Redis compartilhado;
- coordenação distribuída;
- rate limit distribuído;
- redução de chamadas ao Supabase;
- fila BullMQ para Gemini;
- idempotência de pagamentos;
- observabilidade;
- runtime preparado para múltiplas instâncias;
- telemetria HTTP/TCP;
- hardening das conexões HTTP do Node.

---

## 2. Frontend

### 39F.13A — Frontend até 500 VUs

Resultado:

- VUs máximos: 500;
- erros: praticamente zero;
- p95: 4662,23 ms;
- SLO de p95 abaixo de 5 segundos: aprovado;
- frontend permaneceu disponível.

Resultado final:

**PASS**

O frontend suportou o teste de 500 VUs dentro do SLO definido.

---

## 3. Backend antes do hardening HTTP

### 39F.13B — Backend até 500 VUs

Resultado:

- forte degradação de latência;
- aproximadamente 16% de falhas;
- p95 próximo de 27,8 segundos;
- request timeouts;
- conexões TCP encerradas remotamente;
- mesmo processo Node permaneceu ativo;
- Redis permaneceu saudável;
- BullMQ permaneceu saudável.

Resultado:

**FAIL**

---

### 39F.13C — Backend até 250 VUs

Resultado:

- aproximadamente 28% de falhas;
- p95 próximo de 18,9 segundos;
- p99 próximo de 24,8 segundos;
- resets TCP;
- timeouts;
- processo Node não reiniciou;
- Redis permaneceu saudável.

Resultado:

**FAIL**

---

## 4. Diagnóstico pós-saturação

### 39F.13D

Após os testes de saturação:

- 20 de 20 requests sequenciais responderam corretamente;
- p95 sequencial aproximadamente 515 ms;
- Redis saudável;
- BullMQ saudável;
- backend recuperado;
- nenhum restart persistente.

Resultado:

**PASS**

---

## 5. Métricas do Render

### 39F.13E

Durante os testes:

#### Memória

- limite do serviço: 512 MB;
- utilização observada aproximadamente 90–95 MB;
- sem aproximação do limite.

#### CPU

- limite do serviço: 0,5 CPU;
- maior utilização visual observada muito abaixo do limite;
- sem evidência de saturação de CPU.

#### Bandwidth

- sem evidência de saturação relevante.

#### Response Times

O detalhamento de percentis do Render estava bloqueado no plano atual.

Conclusão:

Não houve evidência de CPU, memória ou bandwidth como causa principal das
falhas de concorrência.

---

## 6. Telemetria HTTP/TCP

### 39F.13F / 39F.13G

Foi adicionada observabilidade no nível do HTTP Server do Node.

A telemetria mede:

- requests recebidos pelo HTTP Server;
- requests simultâneos;
- pico de requests;
- respostas concluídas;
- respostas fechadas antes de finish;
- requests abortados;
- requests dropped;
- conexões TCP;
- pico de conexões;
- socket errors;
- socket timeouts;
- timeouts configurados no Node.

A telemetria não armazena:

- IP;
- URL;
- headers;
- query string;
- body;
- usuário.

Validação em produção:

- telemetria ativa;
- 10/10 requests sequenciais concluídos;
- todos os requests chegaram ao Node;
- nenhum erro de transporte durante a prova.

Resultado:

**PASS**

---

## 7. Linha de base de 50 VUs

### 39F.13H

Resultado:

- 958 requests k6;
- 959 requests adicionais observados no Node incluindo health final;
- 0% de falhas;
- p95: 843,80 ms;
- nenhuma requisição perdida antes do Node;
- nenhum erro interno de transporte.

Resultado:

**PASS**

---

## 8. Diagnóstico de 100 VUs antes do hardening

### 39F.13I

Resultado:

- 1034 requests;
- aproximadamente 10% de falhas;
- p95: 7002,22 ms;
- p99: 18731 ms;
- resets TCP;
- unexpected EOF;
- falhas HTTP/2;
- aproximadamente 90 requests não chegaram ao HTTP Server do Node;
- Node não reiniciou;
- erros internos de transporte permaneceram em zero.

Resultado:

**FAIL**

Esse teste mostrou que parte importante das falhas acontecia antes do evento
`request` do HTTP Server do Node.

---

## 9. Hardening HTTP

### 39F.13J / 39F.13K

Foi alterada a configuração HTTP do Node para:

- `keepAliveTimeout`: 120000 ms;
- `headersTimeout`: 125000 ms;
- `requestTimeout`: mantido em 300000 ms.

A configuração foi validada no ambiente de produção.

Resultado:

**PASS**

---

## 10. Reteste de 100 VUs após hardening

### 39F.13L

Resultado:

- 2435 requests;
- 0% de falhas;
- p50: 224,82 ms;
- p90: 300,12 ms;
- p95: 383,43 ms;
- p99: 609,19 ms;
- máximo: 841,92 ms;
- 0 requests perdidos antes do Node;
- 0 closed;
- 0 aborted;
- 0 dropped;
- 0 socket errors;
- 0 socket timeouts;
- mesma instância permaneceu ativa.

Comparação com o teste anterior de 100 VUs:

- falhas: aproximadamente 10% -> 0%;
- p95: 7002,22 ms -> 383,43 ms;
- requests não entregues ao Node: aproximadamente 90 -> 0.

Resultado:

**PASS**

O hardening HTTP apresentou melhora muito significativa neste perfil.

---

## 11. Teste de 150 VUs

### 39F.13M

Resultado:

- 4052 requests;
- 0% de falhas;
- p50: 227,09 ms;
- p90: 389,73 ms;
- p95: 535,37 ms;
- p99: 1152,35 ms;
- máximo: 1585,68 ms;
- 0 requests não entregues ao Node;
- nenhum erro de transporte;
- nenhuma reinicialização.

Resultado:

**PASS**

---

## 12. Teste de 200 VUs

### 39F.13N

Resultado:

- 5913 requests;
- 0% de falhas;
- média: 330,64 ms;
- p50: 232,52 ms;
- p90: 618,87 ms;
- p95: 810,86 ms;
- p99: 1367,55 ms;
- máximo: 3444,42 ms;
- 0 requests não entregues ao Node;
- 0 closed;
- 0 aborted;
- 0 dropped;
- 0 socket errors;
- 0 socket timeouts;
- mesma instância permaneceu ativa.

Resultado:

**PASS**

Este é o maior patamar comprovadamente estável da Etapa 39F.13 no ambiente
atual.

---

## 13. Teste de 225 VUs

### 39F.13O

Resultado:

- 4754 requests;
- taxa real de falhas aproximadamente 0,95%;
- p50: 266,82 ms;
- p90: 4945,82 ms;
- p95: 5631,14 ms;
- p99: 9067,60 ms;
- máximo: 17771,46 ms;
- 45 requests não chegaram ao HTTP Server do Node;
- 0 closed no Node;
- 0 aborted no Node;
- 0 dropped no Node;
- 0 socket errors no Node;
- 0 socket timeouts no Node;
- mesma instância permaneceu ativa.

Resultado:

**FAIL DE DESEMPENHO**

A taxa de falhas permaneceu ligeiramente abaixo de 1%, mas o p95 excedeu
fortemente o SLO de 2 segundos.

---

## 14. Forense após 225 VUs

### 39F.13P

Após o teste de 225 VUs:

- p95 observado pelo k6: 5631,14 ms;
- p95 recente medido dentro do Node/Express: 0,61 ms;
- event loop p95: 20,37 ms;
- erros 5xx do Node: 0;
- closed: 0;
- aborted: 0;
- dropped: 0;
- socket errors: 0;
- socket timeouts: 0;
- processo permaneceu ativo.

A telemetria mostrou forte diferença entre a latência vista pelo cliente k6 e
a latência das requisições que efetivamente chegaram à aplicação.

Conclusão:

Há forte evidência de degradação no caminho anterior ao processamento da
requisição pelo Express.

Essa evidência não permite atribuir exclusivamente a causa ao Render, pois o
caminho também inclui:

1. k6 no Windows;
2. pilha TCP/HTTP do cliente;
3. rede local;
4. ISP;
5. caminho de internet;
6. edge/proxy;
7. entrega ao HTTP Server do Node.

---

## 15. Logs e Events do Render

### 39F.13Q

Foram verificados Logs e Events do serviço no período dos testes.

Não foram observados:

- crash;
- OOM;
- restart inesperado;
- health check failure;
- SIGTERM;
- SIGKILL;
- rollback;
- erro de aplicação relacionado ao teste.

Os únicos eventos relevantes eram os deploys normais.

O Render registrou:

`WEB_CONCURRENCY=1`

no ambiente atual.

Conclusão:

Não há evidência de restart ou falha persistente do processo Node durante os
testes.

---

## 16. Envelope de capacidade comprovado

| Patamar | Resultado | p95 |
|---|---|---:|
| 50 VUs | PASS | 843,80 ms |
| 100 VUs pós-fix | PASS | 383,43 ms |
| 150 VUs | PASS | 535,37 ms |
| 200 VUs | PASS | 810,86 ms |
| 225 VUs | FAIL desempenho | 5631,14 ms |

### Maior patamar comprovado

**200 VUs concorrentes**

Nesse patamar:

- disponibilidade observada: 100%;
- requests testados: 5913;
- p95: 810,86 ms;
- requests perdidos antes do Node: 0;
- erros internos de transporte: 0;
- reinicializações: 0.

---

## 17. Limites da conclusão

200 VUs não devem ser interpretados como o limite matemático absoluto do
BetAnalytics.

O que foi comprovado é:

- 200 VUs passaram;
- 225 VUs não atenderam ao SLO.

O ponto exato de degradação entre esses valores não foi investigado porque
continuar pressionando produção teria baixo valor técnico e risco
desnecessário.

---

## 18. Decisão de custo

Por decisão de economia, permanecem adiados:

- worker Render dedicado;
- segunda instância web;
- autoscaling;
- upgrade de plano apenas para métricas;
- infraestrutura adicional paga.

A arquitetura já foi preparada para evolução futura quando houver necessidade.

---

## 19. Política para novos testes

Não executar novamente em produção, sem nova decisão técnica:

- 250 VUs;
- 500 VUs backend;
- 1000 VUs;
- cargas progressivamente maiores.

Testes acima de 200 VUs devem depender de pelo menos uma das seguintes
condições:

1. ambiente separado de carga;
2. gerador de carga externo/distribuído;
3. múltiplas instâncias reais;
4. análise adicional da edge/rede;
5. decisão explícita de investimento em infraestrutura.

---

## 20. Status final da Etapa 39F.13

- frontend até 500 VUs: aprovado;
- backend até 200 VUs no perfil seguro testado: aprovado;
- backend em 225 VUs: fora do SLO;
- CPU como gargalo: não evidenciado;
- memória como gargalo: não evidenciado;
- crash do Node: não evidenciado;
- Redis: saudável;
- BullMQ: saudável;
- telemetria HTTP/TCP: operacional;
- hardening keep-alive: operacional;
- 250/500/1000 backend: bloqueados por decisão técnica.

**ETAPA 39F.13 ENCERRADA.**

Próximos testes de escala acima do envelope comprovado ficam condicionados a
nova estratégia de infraestrutura ou geração de carga.
