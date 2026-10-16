# ADR-001 — Monólito modular como alvo
**Status:** proposto, sujeito à auditoria da API atual.

**Contexto:** duas peças de matching/propostas foram descritas como existentes, mas desintegradas; escala demonstrativa da comunidade ~150 integrantes.

**Decisão:** preservar front React e backend NestJS e introduzir módulos/adapters no código existente, sem criar microserviços nem RAG. PostgreSQL/Prisma seguem como fonte de verdade.

**Consequência:** menos infraestrutura e menor custo inicial; exige disciplina nas fronteiras de domínio e testes para evitar monólito acoplado.
