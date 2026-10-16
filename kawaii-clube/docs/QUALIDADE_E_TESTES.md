# Qualidade, segurança, testes e limitações

## O que foi automatizado neste pacote

Os testes em `apps/web/tests/domain.test.ts` e `apps/web/tests/gateway.test.ts` cobrem: preenchimento da proposta por modalidade, relação com empresa, elegibilidade, sinais confirmados/inferidos, seleção de canal, ausência de consentimento, limite de frequência, duplicidade de comunicação, diferença `SENT/DELIVERED`, transições inválidas e campos obrigatórios.

Rodar `npm run test` na raiz após Node 22+. São **testes de domínio**, não substituem E2E.

## Matriz adicional de QA manual

| ID | Cenário | Esperado |
|---|---|---|
| E2E-01 | Abrir conta usuária e acessar oportunidades | Navegação permitida |
| E2E-02 | Filtrar apenas empresas | Somente relações com empresa |
| E2E-03 | Abrir match e iniciar rascunho duas vezes | Mesmo rascunho |
| E2E-04 | Salvar proposta com objetivo vazio | Erro sem perda de dados |
| E2E-05 | Modificar versão de rascunho em duas sessões | Conflito no backend real (demo não garante multiaba) |
| E2E-06 | Entrar como equipe e filtrar integrantes | Resultado atualizado |
| E2E-07 | Agendar contato sem canal autorizado | Erro e nenhum registro novo |
| E2E-08 | Agendar o mesmo template duas vezes | Segunda solicitação bloqueada |
| E2E-09 | Processar mensagem com falha simulada | Status FAILED, sem indicação de entrega |
| E2E-10 | Registrar presença duas vezes no mesmo evento | Segundo check-in bloqueado |
| E2E-11 | Redimensionar para 375 px | Navegação e formulários usáveis |
| E2E-12 | Ativar reduced motion | Transições decorativas reduzidas |

## Gestão de requisitos

A documentação original tem 24 histórias no backlog. Decisão posterior: WhatsApp/e-mail são canais obrigatórios do Desafio 01. Consulte `BACKLOG_DELTA_COMUNICACAO.csv` para RF-C09 a RF-C15 que ainda devem ser incorporados ao backlog canônico após validação de escopo.

## Segurança: não levar mock para produção

O front usa login de demonstração e persistência local. Não armazena segredos, não tem autorização backend real e **não deve ser usado com dados pessoais reais**. O NestJS de referência escuta apenas `127.0.0.1` e bloqueia start se `DEMO_MODE` for diferente de `true`.

## Evidências de verificação

- Os testes de domínio e integração simulada rodaram com Node 22 e passaram (19 casos).
- A verificação sintática de TS/TSX pode ser executada localmente.
- Um build/preview integrado completo depende da instalação das dependências npm. Sem isso, **não declarar** que a interface foi validada em navegador ou homologada para produção.
