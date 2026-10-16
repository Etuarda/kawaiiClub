# Kawaii Clube — Desafio técnico | Entrega organizada

**Projeto demonstrativo e arquitetura de referência** para os dois desafios. Baseado no HTML anexado, nos documentos de estratégia e nas decisões combinadas até 16/10/2026.

> **IMPORTANTE:** não é uma cópia da API de produção e não realiza envios reais. A integração com matching, gerador de propostas, Meta WhatsApp Cloud API, SMTP/SendGrid, Firebase e banco PostgreSQL **não foi validada**. Não publicar esta demo como produção.

## O que está dentro

- `apps/web`: **React 19 + TypeScript + Vite**; duas áreas com rotas separadas e modo demonstrativo persistido no navegador.
- `apps/api`: **NestJS** de referência, local e deliberadamente limitado, com recomendações e rascunhos em memória. Não é conectado automaticamente ao front-end.
- `reference/prototipo-original.html`: seu **HTML original integral**, sem substituí-lo.
- `contracts/openapi-reference-v1.yaml`: OpenAPI proposto, anterior à inspeção da API oficial.
- `docs/`: plano estratégico, backlog, especificação e documentação de arquitetura, fluxos, testes e implantação.
- `apps/web/src/assets/logo-kawaii.png`: logo recebida. Imagem de baixa resolução, ideal substituir por arquivo vetorial oficial para produção.

## Executar o front-end demonstrativo

Pré-requisitos: **Node.js 22+** e npm. As dependências não estão incluídas no ZIP.

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. O login segue o visual de referência (tela dividida, Playfair Display + Inter). Use um dos botões de **conta de demonstração** ou digite as credenciais fictícias:

- **Empreendedora** (`vanessa@docesdavanessa.com.br` / `kawaii123`): início e jornada, central de oportunidades (busca, filtros, salvas, ocultar), detalhe do match em modal, editor de proposta em etapas (conteúdo → revisão → concluída), minhas propostas com negociações e aceite das duas partes, perfil profissional com completude.
- **Equipe Kawaii** (`equipe@kawaiiclube.com.br` / `kawaii123`): dashboard, gestão de integrantes (busca no topo, filtro por etapa, adicionar integrante), detalhe, campanhas para segmentos com alcance por consentimento (“Novo disparo”), fila WhatsApp/e-mail simulada, automações com pausa por etapa, eventos com check-in e criação de evento, relatórios.

O login é **demonstrativo**: as contas ficam em `apps/web/src/infrastructure/demo-auth.ts`, sem JWT nem hash. O tema claro/noturno fica no rodapé da barra lateral e no topo.

Tudo é dado **fictício** e fica salvo em `localStorage`. Use **Reiniciar dados** no menu lateral para restaurar a demo. O fluxo não depende da API NestJS para iniciar.

### Testar regras de domínio

```bash
npm run test
```

Os testes de domínio são executáveis com Node.js 22+ usando suporte experimental a TS. Verificam elegibilidade, modalidades, mensagens, validação de propostas e fluxos simulados de integração (30 testes, incluindo aceite bilateral, completude do perfil, alcance de campanha por consentimento, criação de integrante e de evento).

### Typecheck e build (dependem de npm install)

```bash
npm run typecheck
npm run build
```

## Executar o esqueleto API local (opcional)

```bash
DEMO_MODE=true npm run dev:api
```

Fica em `http://127.0.0.1:3001`; serve alguns contratos simulados de recomendação e proposta. É um **esqueleto sem autenticação real**: só escuta loopback, só inicia com `DEMO_MODE=true` e não deve ser implantado publicamente. Não substitui o backend oficial Kawaii. Mais detalhes em `docs/ARQUITETURA.md`.

## Fluxos implementados na demo

### Desafio 02 — empreendedora

1. Escolher conta demonstrativa **empreendedora**.
2. Explorar oportunidades; buscar e filtrar **Apoio, Permuta, Collab e Empresas**.
3. Visualizar perfil, necessidades e evidências confirmadas/inferidas.
4. Iniciar proposta — matching revalidado, **chave idempotente** e campos pré-preenchidos conforme modalidade/relação.
5. Editar objetivo, escopo, contribuições, condições e prazo.
6. Salvar rascunho ou **marcar para revisão**, com controle de versão.
7. Consultar histórico de rascunhos. **Não há envio nem aceite real.**

### Desafio 01 — equipe

1. Escolher conta demonstrativa **equipe Kawaii**.
2. Dashboard com KPIs **da amostra de 10 participantes fictícias**, não da Kawaii real.
3. Filtrar e consultar integrantes e permissões por canal.
4. Agendar lembrete/template por **WhatsApp ou e-mail** (simulação); valida consentimento ilustrativo, janela de frequência e duplicidade.
5. Processar, cancelar ou reagendar mensagens simuladas; `SENT` não é `DELIVERED`.
6. Explorar a régua D0/D3/D5/D7 (representação conceitual; sem scheduler ativo).
7. Consultar eventos e **registrar presença** em dados fictícios; impedir duplicidade.
8. Consultar relatórios, com ressalva sobre métricas e denominadores.

## Estado real das funcionalidades

| Capacidade | Estado neste pacote |
|---|---|
| Protótipo original anexo | Preservado como HTML independente |
| Front-end React modular | Implementado, requer instalação de dependências |
| Navegação e papéis de demonstração | Funcionais apenas no navegador; **não são autenticação segura** |
| Matches explicáveis e filtros | Dados fictícios |
| Propostas editáveis com persistência | Mock em `localStorage` |
| Validação de idempotência e versões | Implementada na simulação; sem transações distribuídas |
| Mensagens WhatsApp/e-mail | Agendamento e estados **simulados**; nunca envia |
| Eventos e presença | Mock em `localStorage` |
| Roda automática de D0/D3/D5/D7 | **Planejada, não implementada como scheduler** |
| API NestJS local | Esqueleto parcial com memória |
| PostgreSQL/Prisma e API oficial | **Não conectados** |
| IA generativa e ranking treinado | **Não implementados**; evolução P2 |
| Aceite bilateral, execução, receitas | **Não implementados**; dependem do fluxo real e regras existentes |

## Convenções de Clean Code

- Nomes de domínio em inglês e textos de interface em português brasileiro.
- Regras de domínio puras em `domain/`; componentes sem decisão crítica de negócio.
- Dependência do front-end por meio de interface `KawaiiGateway`.
- Repositório mock isolado, substituível por adapter HTTP.
- Validação de regra e tipos estritos; sem scores probabilísticos inventados.
- Estados reais de mensagens e propostas separados das animações de interface.
- Evitar overengineering: sem filas, Redis, microserviços ou LLM no caminho do match para a prova técnica.
- Uma única fonte de verdade por ambiente; nunca sincronizar planilha paralela.

## Próxima etapa para integração real

1. Auditar o **schema Prisma**, Swagger, repositório de matching e gerador de propostas existentes.
2. Conciliar o contrato proposto com as rotas, IDs e estados reais.
3. Implementar autenticação JWT/authorization por recurso no backend **real**; não reutilizar login demonstrativo.
4. Trocar `demoGateway` por HTTP adapter mantendo os mesmos casos de uso e tratamento de erro.
5. Adotar transações/uniques em PostgreSQL para idempotência e estados concorrentes.
6. Integrar consentimentos e provedor real de WhatsApp/e-mail somente em ambiente autorizado.
7. Executar testes de contrato, integração e E2E e revisar design system oficial.

Veja também `docs/ARQUITETURA.md`, `docs/FLUXOS_E_TELAS.md`, `docs/QUALIDADE_E_TESTES.md`, `docs/INTEGRACAO_REAL.md`, `docs/DIRECAO_VISUAL_E_MOTION.md` e `docs/ROTEIRO_APRESENTACAO_20_MIN.md`.

**Verificação deste pacote (16/10/2026, porte do visual de referência):** 30 testes de Node.js aprovados, `tsc --noEmit` do front-end sem erros, `vite build` concluído e telas conferidas no navegador (desktop, 390 px e modo noturno). O build da API NestJS não foi executado nesta rodada.
