# ADR-004 — Matching explicável antes de ML
**Status:** evolução proposta; o motor existente deve ser auditado antes de alterações.

**Contexto:** existe racional histórico com filtros, pesos qualitativos e regra de 2 sinais em recorte específico.

**Decisão:** elegibilidade hard rules → busca de candidatos → ranking por modalidade → evidências e explicação → feedback. Não exibir score heurístico como probabilidade calibrada.

**Consequência:** comportamento verificável e custo previsível; não garante otimização estatística sem resultados rotulados. A política de dois sinais não é automaticamente global.
