# Plano de integração com Kawaii API existente

Este pacote **não atesta** ter acessado os repositórios privados, as credenciais ou o banco real. As funcionalidades operacionais são **simulações fiéis aos fluxos**, não integração de produção.

## Checklist da auditoria (primeiro dia)

1. Verificar README, AGENTS.md e configurações do repositório oficial.
2. Inspecionar `prisma/schema.prisma`: entidades, chaves, estados, constraints e índices existentes.
3. Abrir Swagger e verificar prefixo efetivo da API (`/api` se confirmado), auth, erros, paginação e versionamento.
4. Localizar o serviço de matches: critérios, exclusões, retorno, versões e casos positivos/negativos.
5. Localizar a automação de geração de propostas: contrato de entrada, processamento e saída; verificar se é síncrona.
6. Validar mudanças de posts/chats, aceite bilateral e limite de planos.
7. Conferir integrações Meta WhatsApp Cloud API e e-mail; ativação somente com aprovação de produto/jurídico.
8. Rodar testes e criar fixtures antes de alterar código legado.

## Como substituir mocks do front-end

`apps/web/src/infrastructure/demo-gateway.ts` declara `KawaiiGateway`. Criar uma implementação `HttpKawaiiGateway` que:

- Use cliente HTTP autenticado e DTOs validados na borda.
- Converta os dados reais aos modelos de apresentação; não vaze o schema Prisma para componentes.
- Preserve o envelope `{success,data}` e mapeie 401, 403, 404, 409, 422, 503.
- Passe `Idempotency-Key` nas criações e versão esperada nas edições.
- Respeite query cache, invalidação e cancelamento de requisição; TanStack Query é recomendado no projeto oficial.
- Trate status assíncronos (202 / geração pendente) se o gerador for lento.
- Nunca confie em `matchRef` como autorização, tampouco em papel determinado no navegador.

O documento `contracts/openapi-reference-v1.yaml` é **proposta**, não contrato confirmado. IDs numéricos para participantes/oportunidades e `matchRef` opaco, se conciliados com o backend real.

## Exemplo de adapter conceitual

```ts
interface MatchingPort {getRecommendation(ref:string,actorId:number):Promise<Recommendation>}
interface ProposalGeneratorPort {generate(input:GenerationContext):Promise<GeneratedDraft>}

async function createFromMatch(ref:string,actorId:number,key:string){
  // 1. authorize(actorId); 2. resolve ref;
  // 3. recheck conflicts and state inside a suitable transaction;
  // 4. transform existing matching output to generator input;
  // 5. persist idempotently; 6. return reviewable draft;
  // 7. emit event without PII.
}
```

## Correções exigidas antes de produção

- JWT e autorização no servidor; demo login é insuficiente.
- Multiusuário/multiaba com transações e constraints PostgreSQL.
- Conciliação de modalidade versus relação empresarial.
- Integração de ofertas/demandas e status existentes; não criar schema concorrente.
- Limites, consentimentos e webhooks verificados com provedores.
- Filas/outbox se comprovada necessidade.
- Testes com ambientes separados e rollout com rollback.

## Dúvidas de negócio

- O que caracteriza execução confirmada e quem verifica?
- Qual modalidade exata da oportunidade B2B? Commercial é relação, ou status? Confirmar.
- A política histórica de dois sinais vale em quais modalidades?
- Conflito/duplicidade de conversas exige exclusão em quais estados?
- Quando e por qual canal é lícito enviar mensagens a membros?
- Existem templates de WhatsApp aprovados e domínio de e-mail autenticado?
- Qual o mecanismo real de monetização da Kawaii?
