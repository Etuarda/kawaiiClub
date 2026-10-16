# Orientação a agentes de código — Kawaii Clube

## Missão
Dar continuidade ao desafio técnico sem confundir demonstração com produção. Dois usuários/experiências: **equipe interna** (Clube, comunicação WhatsApp/e-mail, eventos) e **empreendedora** (oportunidades, matches, propostas).

## Ordem de leitura
1. `README.md` — como executar e limitações.
2. `docs/ARQUITETURA.md` — decisões, fronteiras e diagramas.
3. `docs/FLUXOS_E_TELAS.md` — telas e comportamento.
4. `docs/INTEGRACAO_REAL.md` — o que falta validar.
5. `contracts/openapi-reference-v1.yaml` — **proposta**, não API oficial.
6. `docs/Kawaii_Clube_Plano_Estrategico_Integrado_v2.docx` — referência estratégica.
7. `reference/prototipo-original.html` — referência visual/funcional anexada.

## Padrão de trabalho
- Inspecionar antes de alterar. Não criar nova API/tabela sem conciliar com serviços existentes.
- Manter componentes React com estado de UI, **regras puras no domínio**, adaptação de dados em `infrastructure`.
- Não importar infraestrutura nos módulos de domínio.
- Criar testes antes de alterar elegibilidade, idempotência, estados ou consentimento.
- Garantir layout mobile, teclado, `prefers-reduced-motion`, loading/empty/error/success.
- Não assumir que `COMMERCIAL` é modalidade equivalente a Apoio/Permuta/Collab; empresa é tipo de relação.
- Não inventar match score como probabilidade de sucesso.
- Não instalar microserviços, Redis, embeddings ou LLM sem hipótese de ganho mensurável.
- Nenhum envio real por WhatsApp/e-mail sem autorização, consentimento e configuração explícita.
- Preserve arquivos de referência e decisões antigas para rastreabilidade; documente divergências.

## Critério de pronto
- Critérios de aceitação da história atendidos.
- Testes de domínio/regressão executados.
- Estados e acessibilidade conferidos.
- Contratos/README atualizados.
- Limitações e mocks identificados na interface.
