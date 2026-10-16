# ADR-002 — Prova funcional com dados fictícios
**Status:** adotado nesta entrega.

**Contexto:** código, credenciais e contrato do gerador real não foram auditados.

**Decisão:** front-end React funcional com `KawaiiGateway` simulado e persistência local, mais API NestJS de referência com dados em memória. Nenhum canal real é acionado.

**Consequência:** permite demonstrar UX e decisões de engenharia; não evidencia integração real, performance de produção ou segurança de dados pessoais.
