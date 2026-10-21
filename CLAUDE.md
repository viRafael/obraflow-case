# CLAUDE.md — Contexto do projeto

## O que é
Desafio técnico do processo seletivo da **ObraFlow** (startup, vaga dev júnior, PJ, remoto, 30h/sem).
Enunciado completo no `README.md` (original deles — **não sobrescrever a seção do desafio**; nossa documentação
entra em seção própria, ex.: `## Decisões técnicas`, ou o README é reescrito só no final, de forma consciente).

- **Prazo:** 01/11/2026 às 23:59 — entrega via **Pull Request** a partir de um **fork** de `ObraFlow/obraflow-case`.
- No PR: e-mail e telefone/WhatsApp do candidato.
- Processo: 1) desafio → 2) entrevista técnica **analisando o código** (30 min) → 3) entrevista com sócio.
- IA é permitida, mas o candidato precisa explicar **cada decisão**. Priorizar código simples, legível e defensável.
- Áreas de interesse da vaga incluem IA/PLN — possível extra opcional, só depois do obrigatório pronto.

## Domínio (resumo)
**Dokimos** = serviço de aprovações por **alçada** do ObraFlow (ERP de construção civil).
- **Obra**, **Usuário**, **Fornecedor**, **Pedido de compra** (cabeçalho + N itens), **Regra de alçada** (por obra, faixas de valor, cada faixa com aprovadores ordenados).
- A alçada é escolhida pelo **valor total do pedido** (soma de `quantidade × preço unitário` dos itens).
- Aprovação sequencial: só o aprovador atual decide; aprovação avança para o próximo; **rejeição exige motivo** e encerra o fluxo.
- Histórico de decisões preservado (trilha auditável).

## Telas exigidas
1. **Cadastro de pedido** — obra, fornecedor, data, observações; N itens (descrição, qtd decimal > 0, unidade, preço ≥ 0, total calculado não editável); total do pedido; botão "Cadastrar pedido" só habilitado se tudo válido.
2. **Aprovação** — lista (id, obra, fornecedor, data, nº itens, total, situação, alçada atual: concluídos/atual/próximos, ações); detalhe com itens + histórico; ações desabilitadas com explicação quando a cadeia terminou.
3. **Regras de alçada** — selecionar obra; CRUD de faixas; limite de valor; adicionar/remover/**reordenar** aprovadores; listar regras salvas.

## Validações/estados obrigatórios
Erro por item (qtd/preço inválidos), pedido sem itens, campos obrigatórios por campo, empty state sem obras,
API fora/500 com "tentar novamente", rejeitar sem motivo bloqueado no front, cadeia concluída = botão desabilitado + explicação,
**loading state em toda lista**, responsividade.

## Critérios de avaliação
Funcionamento completo 25% · Modelagem da alçada 20% · Qualidade de código 15% · **UI 20%** · Estados/validações 10% · Docs 10%.

## Stack (escolha do candidato — tecnologias que ele domina)
- **Backend:** Node + **NestJS** + **Prisma** + **PostgreSQL**
- **Frontend:** **Next.js** + React
- **Infra:** **Docker** / docker compose (Postgres e, idealmente, a aplicação toda)

## Design de produto (fase atual)
- O candidato vai gerar as telas no **Claude Design** com os prompts de `docs/design/claude-design-prompts.md`
  (briefing mestre + 1 prompt por tela + revisão de estados). Prazo: ~1 dia, baixa/média fidelidade; polimento é feito no código.
- Destaques aprovados: seletor **"Visualizando como"** (simulação de persona, só front); prévia da cadeia em tempo real no form;
  stepper da alçada na lista + drawer com timeline; régua visual das faixas + "Testar valor" na tela de alçadas.
- **Não** mostrar "faltam R$ X para mudar de faixa" (incentivaria fracionamento de compra).
- Os **dados de exemplo** do Prompt 0 (obras, usuários, fornecedores, faixas, pedidos #9–#12) devem ser os mesmos do seed do backend.
- Depois do design: derivar o contrato da API a partir das telas → backend → front.
- **Design pronto**, copiado em `docs/design/export/canvas/` (canvas: https://claude.ai/artifact/MVmw1mojRWkZokNnAQhQdp).
  Fonte visual oficial: `Main`, `Errors`, `NoRule`, `LastItem`, `Mobile`, `EmptyState`, `Ped_*` (exceto os abaixo) e `Alc_Main/Alert/Modal/ModalErrors/Empty/Skeleton`.
  As telas da linha "Correções" (`NovoPed_Skeleton`, `Toast_*`, `DarkMode_Ped`, `Ped_DrawerBlocked`, `Ped_PostSubmit`, `Ped_MobileDrawer`,
  `Alc_Unauthorized`) usam outro visual e outros dados: servem só como referência do **estado**, não do layout.
- Desvios do design a corrigir no código (não no canvas):
  - PED-001 (R$ 12.500, Ed. Maré) aparece com João → Amanda → Carlos; o correto é **João → Amanda** (faixa 2).
  - Remover textos de notificação ("Solicitante notificado", "notificado por e-mail"): não existe notificação.
  - Faixas exibidas como "R$ 10.001": o correto é "R$ 10.000,01"; a faixa 1 começa em R$ 0,00.
  - Remover: tela 403, botões "Nova obra"/"Cadastrar obra", links de guia/suporte, KPIs inventados do modo escuro, rota de login.

## Plano de trabalho
1. **Backend primeiro** (API, modelagem, regras, seed, testes da lógica de alçada).
2. **Frontend depois** — o candidato tem ideias próprias para a UI; propor, não impor.
3. README final: setup, seed, endpoints/payloads, screenshots, decisões técnicas, o que mudaria em produção.

Estrutura: **monorepo pnpm** com `apps/api` (Nest) e `apps/web` (Next) + `docker-compose.yml` na raiz.

## Decisões de modelagem (fechadas com o candidato)
- **Faixas = cadeia explícita.** Cada faixa define sua cadeia completa; o pedido cai em exatamente uma faixa
  (sem acumular faixas anteriores). Ex.: "até 10k → João", "acima de 10k → João → Amanda".
- **Faixa modelada só pelo limite superior** (`maxAmount`, `null` = sem limite). A faixa cobre `(limite anterior, maxAmount]`,
  ordenando por `maxAmount`. Assim não existem buracos nem sobreposições por construção. Únicos por obra: `maxAmount` e no máximo uma faixa "sem limite".
- **Valor sem regra aplicável → bloquear a criação** (422 com mensagem clara). Há um endpoint de prévia da cadeia para o form.
- **Sem login e sem 403 por cargo** (decidido). Rotas, campos e enums da API **sempre em inglês**; interface em português.
- **Alçadas: CRUD por faixa** (`POST/PUT/DELETE`), não um `PUT` em lote.
- **Contrato da API:** `docs/api-contract.md` é a fonte da verdade para rotas, payloads e erros.
- **Identidade = simulação, sem autenticação.** A decisão é atribuída ao aprovador da etapa atual. O cliente envia o `stepId`
  que está vendo; se não for mais a etapa atual → 409 (impede decisão fora de ordem/duplicada).
- **Snapshot da cadeia no pedido:** ao criar, os aprovadores são copiados para `ApprovalStep` do pedido; editar regras não afeta pedidos existentes.
- **Nível atual persistido** no pedido (`currentStep`), atualizado em transação com update condicional (lock otimista).
- **Rejeição exige motivo** (validado no back também), encerra o fluxo; etapas seguintes ficam `SKIPPED`.
- Valores monetários: `Decimal` no banco, strings no JSON (nunca float). Totais calculados no backend.

## Git / entrega
- `origin`   → `git@github.com:viRafael/obraflow-case.git` (fork do candidato, GitHub user `viRafael`)
- `upstream` → `git@github.com:ObraFlow/obraflow-case.git` (repo deles, só leitura)
- Branch de trabalho: `desafio/rafael-vieira`. Commits pequenos e frequentes.
- Entrega: push da branch no fork → PR para `ObraFlow/obraflow-case:main` (pode abrir como Draft antes), com e-mail e WhatsApp na descrição.
- `gh` CLI instalado pelo candidato (login dele; o ambiente do Claude pode não enxergar o token).

## Como colaborar com o candidato
- Explicar o porquê das decisões (ele precisa defendê-las na entrevista).
- Responder em português.
