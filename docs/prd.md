# PRD — Dokimos (pedidos de compra com aprovação por alçada)

PRD enxuto: aponta para os documentos que já detalham cada parte e acrescenta só o que falta neles
(critérios de aceite, plano e riscos).

| Assunto | Documento |
|---|---|
| Enunciado e critérios de avaliação | [`README.md`](../README.md) |
| Decisões e contexto do projeto | [`CLAUDE.md`](../CLAUDE.md) |
| Telas e estados | [`design/export/canvas/`](design/export/canvas/) · [canvas](https://claude.ai/artifact/MVmw1mojRWkZokNnAQhQdp) |
| Rotas, payloads, erros e modelo da alçada | [`api-contract.md`](api-contract.md) |

## 1. Problema

Construtoras precisam de controle sobre o que é comprado em cada obra. Compras pequenas devem ser decididas
rápido, perto da obra; compras grandes precisam de mais revisores, em ordem, com trilha auditável de quem
aprovou ou rejeitou e por quê. As regras variam de obra para obra.

## 2. Objetivo

Entregar um fluxo completo e funcional: **cadastrar pedido → cadeia definida pela alçada da obra → aprovações
em sequência → aprovado ou rejeitado com motivo**, com as regras configuráveis por obra.

**Sucesso** = avaliador sobe o projeto com um comando, percorre o fluxo com os dados do seed nas 3 telas,
sem erros, e encontra no README a justificativa de cada decisão.

## 3. Personas

| Persona | Faz | Tela principal |
|---|---|---|
| Comprador(a) — Beatriz | Cadastra pedidos | Novo pedido |
| Aprovador(a) — João, Amanda, Carlos | Aprova/rejeita na sua vez | Pedidos |
| Gestor(a) de alçadas — Amanda | Configura as faixas por obra | Alçadas |

Sem login: o seletor "Visualizando como" troca a persona.

## 4. Escopo

**Dentro:** as 3 telas do README com todos os estados; API e persistência; seed; testes da lógica de alçada;
docker compose; README com decisões técnicas e screenshots.

**Fora (decisão consciente, ver final do contrato):** login e permissões por cargo; edição/cancelamento de
pedido; notificações; telas de cadastro de obra, usuário e fornecedor.

## 5. Critérios de aceite

Cada critério é verificável no app ou num teste. **[T]** = coberto por teste automatizado no backend.

### 5.1 Novo pedido
- [ ] A tela abre com 1 item em branco; é possível adicionar, editar e remover itens.
- [ ] Não é possível remover o último item; a tela explica o motivo.
- [ ] Total do item = quantidade × preço, não editável; total do pedido = soma dos itens, sempre visível.
- [ ] Obra, fornecedor, data e descrição vazios mostram erro no próprio campo.
- [ ] Quantidade ≤ 0, preço < 0 ou valores não numéricos mostram erro na linha do item.
- [ ] O botão "Cadastrar pedido" só fica habilitado com tudo válido; desabilitado, lista as pendências.
- [ ] O painel mostra a faixa e a cadeia prevista para o total atual.
- [ ] Total sem faixa aplicável: alerta claro, link para Alçadas e botão bloqueado.
- [ ] Sem obras cadastradas: empty state, não tela branca.
- [ ] Após cadastrar: toast com o código e o primeiro aprovador; redireciona para a lista destacando o pedido.
- [ ] **[T]** A API recusa itens inválidos (400 com `details` por campo), lista vazia de itens e referências inexistentes (422).
- [ ] **[T]** A API recalcula os totais e ignora qualquer total vindo do cliente.
- [ ] **[T]** Total sem faixa → 422 `NO_APPROVAL_RULE`, nada é gravado.
- [ ] **[T]** Pedido criado grava cabeçalho, itens, totais, etapas (1ª `PENDING`, demais `WAITING`) e evento `CREATED`, tudo numa transação.

### 5.2 Pedidos (aprovação)
- [ ] A lista mostra código, data, obra, fornecedor, nº de itens, total, situação e stepper da alçada.
- [ ] Abas Aguardando minha decisão / Pendentes / Aprovados / Rejeitados / Todos, com contadores; filtro por obra; busca.
- [ ] Aprovar/Rejeitar aparecem só para o aprovador da vez; os outros veem "Aguardando <nome>".
- [ ] O drawer mostra itens (descrição, qtd, unidade, preço, total) e o histórico em linha do tempo.
- [ ] Rejeitar abre um modal; o envio fica bloqueado sem motivo (mín. 10 caracteres).
- [ ] Pedido aprovado ou rejeitado: ações desabilitadas com explicação; o motivo da rejeição aparece no histórico.
- [ ] Decisão já tomada por outra pessoa (409): toast de conflito e a lista recarrega.
- [ ] Loading (skeleton), lista vazia e erro com "Tentar novamente".
- [ ] **[T]** Aprovar avança para a próxima etapa; a última aprovação deixa o pedido `APPROVED`.
- [ ] **[T]** Rejeitar exige motivo, deixa o pedido `REJECTED`, marca as etapas seguintes como `SKIPPED` e grava o motivo no histórico.
- [ ] **[T]** `stepId` que não é a etapa atual → 409 `STEP_NOT_CURRENT`; pedido já decidido → 409 `ORDER_ALREADY_DECIDED`.
- [ ] **[T]** Duas aprovações simultâneas da mesma etapa: só uma é aplicada.

### 5.3 Alçadas
- [ ] É possível selecionar a obra e ver as faixas ordenadas, com início calculado e cadeia de aprovadores.
- [ ] Criar, editar e remover faixas; definir o limite ou "sem limite".
- [ ] Adicionar, remover e reordenar aprovadores (arrastar e botões ↑ ↓), escolhendo entre os usuários disponíveis.
- [ ] A régua de valores mostra a cobertura; sem faixa "sem limite", destaca o trecho bloqueado.
- [ ] "Testar valor" mostra a faixa e a cadeia aplicadas ou "nenhuma faixa cobre".
- [ ] Obra sem faixas: empty state explicando que os pedidos estão bloqueados.
- [ ] Erros de validação no modal: limite duplicado, segunda faixa "sem limite", nenhum aprovador.
- [ ] Loading e erro com "Tentar novamente".
- [ ] **[T]** A resolução de faixa respeita os limites: exatamente no limite cai na faixa; 1 centavo acima cai na próxima; total 0,00 cai na 1ª.
- [ ] **[T]** Limite duplicado → 409; segunda faixa sem limite → 409; aprovador repetido ou lista vazia → 400.
- [ ] **[T]** Editar ou remover uma faixa não altera pedidos já criados.

### 5.4 Geral
- [ ] `docker compose up` sobe banco, API e front; o seed popula ao menos 2 obras, usuários, fornecedores, faixas e pedidos nos 3 estados.
- [ ] Layout responsivo em 375 px sem scroll horizontal.
- [ ] API fora do ar: todas as telas mostram erro com "Tentar novamente", nunca tela branca.
- [ ] README com: como rodar, seed, endpoints, screenshots, tecnologias e motivos, modelagem da alçada,
      comunicação front/back, consistência e integridade, o que mudaria em produção.

## 6. Plano de entrega

| Data | Entrega |
|---|---|
| Qua 21/10 | ✅ Design, contrato da API e PRD |
| Qui 22/10 | Monorepo, docker compose, Nest, schema Prisma + migration, seed |
| Sex 23 – Sáb 24/10 | Módulos da API (cadastros, alçadas, pedidos, decisões), erros padronizados, Swagger |
| Dom 25/10 | Testes da lógica de alçada e de concorrência · **backend fechado** |
| Seg 26 – Qui 29/10 | Front: shell + seletor de usuário, Alçadas, Novo pedido, Pedidos/drawer, todos os estados |
| Sex 30/10 | Responsividade, revisão contra os critérios de aceite, compose completo |
| Sáb 31/10 | README, screenshots, abrir o PR |
| Dom 01/11 | **Folga para imprevistos** · prazo 23:59 |

Regra: se um dia atrasar, corta-se do **polimento** (dark mode, animações, drag-and-drop → fica só ↑ ↓), nunca dos critérios de aceite.

## 7. Riscos

| Risco | Mitigação |
|---|---|
| Prazo curto | Plano com folga; ordem de corte definida acima; backend primeiro, porque destrava todo o resto. |
| Design feito para Tailwind v3 / Next 14 | Traduzir os tokens para Tailwind v4 (`@theme`) ao montar o front; o design é referência, não especificação. |
| Telas inconsistentes no canvas | Fonte visual oficial definida no `CLAUDE.md`; os desvios são corrigidos no código. |
| Precisão monetária | `numeric` no banco, `Decimal` no backend, string na API (ver contrato). |
| Concorrência nas decisões | Update condicional + `stepId` → 409; teste automatizado. |
| Precisar defender código gerado com IA | Commits pequenos, código simples, decisões registradas no `CLAUDE.md` e no README. |
| Ambiente do avaliador | Tudo via docker compose; sem serviços pagos nem credenciais externas. |
