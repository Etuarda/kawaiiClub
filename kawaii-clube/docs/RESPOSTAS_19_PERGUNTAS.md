# Respostas consolidadas — Desafio Kawaii (versão escolhida: 4 páginas)

Estas respostas representam **o plano técnico**, não funcionalidades em produção. Consulte o PDF original incluso em `docs/desafio-original.pdf`. Há uma versão alternativa do desafio (7 páginas) cuja segunda parte pede construção de lógica nova de matching; esta entrega responde à versão de **integração das duas peças existentes**.

## Desafio 01 — Clube de Conexões (6 perguntas)

### 1. Como organizar as informações?

Fonte de verdade relacional (PostgreSQL) para participante, ofertas, necessidades, estágio de jornada, consentimento/preferências por canal, comunicações, inscrição, presença e parcerias. Segmentos são derivados de estados e eventos, não duplicações em planilhas. Dados pessoais mínimos e autorização por finalidade.

### 2. Quem recebe cada mensagem?

Motor de segmentação identifica evento, critérios de elegibilidade, exclusões, preferência/consentimento e janela de frequência. Ex.: perfil incompleto recebe orientação; inscrita em evento recebe confirmação; match elegível pode gerar oportunidade contextual. **WhatsApp e e-mail** são os dois canais do projeto; não disparar ambos indiscriminadamente.

### 3. Sequência de boas-vindas?

Régua proposta: **D0** boas-vindas (WhatsApp breve + e-mail de orientação); **D3** perfil incompleto (se necessário); **D5** convite para evento pertinente; **D7** primeira oportunidade real elegível. Parâmetros configuráveis; evitar duplicidade, respeitar opt-out. Cada etapa registra status e falha.

### 4. Como usar IA/automação?

Automação determinística NestJS/worker para gatilhos, segmentação, agendamento e logs. Meta WhatsApp Cloud API oficial e SMTP/SendGrid quando autorizados. IA apenas para interpretar bios, estruturar oferta/demanda, redação assistida ou propostas; templates para comunicações simples. Não adotar LLM síncrono em cada mensagem.

### 5. Como avaliar participação?

Ações relevantes no app, inscrição versus check-in real em eventos, resposta verificável a comunicação individual e registro autorizado de atividades externas. Não inferir presença a partir de inscrição, abertura de e-mail ou leitura presumida de grupos WhatsApp. O painel permite registros manuais quando necessário.

### 6. Quais indicadores?

Taxa de entrega por canal (quando verificada), perfil completo, participação em eventos, cobertura de oportunidades, match→proposta, aceite, execução confirmada, tempo manual poupado e custo por resultado. Definir denominadores/coortes e baseline antes de metas e ROI. North Star proposta: parcerias executadas com benefício confirmado por mês.

## Desafio 02 — App de Parcerias (7 perguntas)

### 1. Ordem de leitura dos materiais?

Contexto de produto e README → regras de negócio → schema Prisma → Swagger/contratos → código do matching → gerador de propostas → posts/chats/notifications → commits/testes → deploy. Comparar documentação com comportamento executável antes de alterar produção.

### 2. Como descobrir entrada/processamento/saída?

Inspecionar tipos, funções, APIs e testes de cada serviço, rodar fixtures e casos positivos/negativos. Mapping conceitual: matching recebe necessidades, ofertas e restrições e devolve recomendações; gerador recebe contexto de oportunidade e devolve rascunho revisável. Não presumir que interfaces reais já correspondem aos exemplos.

### 3. Onde integrar e com que campos?

Adapter no NestJS liga match selecionado à entrada do gerador. Contexto: matchRef, opportunityId, proponente, destinatária, modalidade, relação com empresa, evidências, objetivo/escopo/contrapartidas, versão da política e status. Backend revalida elegibilidade/autorização; criação idempotente, revisão antes do envio.

### 4. Lacunas ou contradições?

Classificar afirmações como confirmadas/hipóteses/pendentes/bloqueantes; verificar fonte de verdade no código e histórico; registrar ADRs e perguntas de negócio. Utilizar mocks rotulados na ausência de acesso. Não converter suposição em mudança irreversível.

### 5. Como configurar e provar integração?

Branch isolada, env sem segredos, Docker/homologação, base e fixtures de teste, execuções separadas e integração ponta a ponta. Casos: permuta e empresa externa, erros, conflitos, duplicidade, autenticação. Provar que os dados corretos chegaram ao rascunho e estados ficaram íntegros, não apenas um 200 HTTP.

### 6. Como não quebrar o existente?

Caracterização e regressão antes de mudar, adapter sem reescrita, TypeScript estrito, validação no servidor, transações/idempotência, migrações compatíveis, PR/CI/revisão, rollback e monitoramento. Não fazer push direto em branch que dispara deploy desconhecido.

### 7. Handoff para próxima pessoa?

README com setup e fluxo de reprodução, arquitetura e diagramas, contratos (entradas/saídas/erros), ADRs, testes/fixtures, variáveis de ambiente sem segredos, observabilidade, dúvidas e limitações, instruções de rollback.

## Complementar — Pensamento crítico (6 perguntas)

### 1. Qual problema primeiro?

Integração match→proposta é o bloqueio técnico explicitamente descrito no enunciado e contribui diretamente para converter oportunidades em propostas. Repriorizar se dados mostrarem gargalo maior em perfis incompletos ou pós-aceite.

### 2. Qual primeira solução?

Central de Oportunidades da empreendedora: recomendações elegíveis, justificativas, detalhes e rascunho revisável com estado visível. Desafio 01 com painel de comunicação como solução paralela de desenho e demo de admin.

### 3. Tecnologias?

React/TypeScript/Vite; NestJS; PostgreSQL/Prisma; OpenAPI, DTOs, Adapter/Strategy por necessidade; Git/CI/Docker; Meta WhatsApp Cloud API e SMTP/SendGrid em evolução autorizada; IA sob demanda. Não introduzir microserviço Python ou RAG no MVP.

### 4. O que entregar em uma semana?

D1 auditoria, D2 contratos/casos, D3 adapter/tests, D4 UI oportunidades, D5 criação/revisão, D6 testes/handoff, D7 apresentação. Sem acesso real, demonstrar mock explicitamente. O enunciado também menciona preparação sugerida curta e apresentação até 20 min; sete dias é cenário hipotético complementar.

### 5. Limitações?

Sem integração real sem acessos; demonstração com dados fictícios, sem envio WhatsApp/e-mail, aceite bilateral ou execução. Sem ML treinado, embeddings, RAG ou ROI comprovado; não alegar impacto de receita.

### 6. Como validar sucesso?

Testes de domínio/contrato/regressão/usabilidade e métricas de match→rascunho, proposta aceita, execução confirmada, taxa de participação e tempo manual economizado. Separar sucesso da interface de impacto comercial observado; comparações estatísticas quando houver histórico adequado.
