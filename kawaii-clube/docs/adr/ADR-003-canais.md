# ADR-003 — WhatsApp e e-mail para a equipe
**Status:** decisão de escopo confirmada para o Desafio 01.

**Contexto:** comunicação e ativação manuais da comunidade; atividades muitas vezes ocorrem fora do app.

**Decisão:** motor de automação alimentado por eventos confiáveis, com WhatsApp Cloud API oficial e SMTP/SendGrid como canais, preferências e consentimento por finalidade, templates aprovados quando requeridos e idempotência.

**Consequência:** menor esforço manual; integrações externas dependem de configuração e autorização. Não presumir acesso a mensagens em grupos nem prova de presença por envio.
