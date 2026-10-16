# Apresentação do desafio — até 20 minutos

## 0:00–2:00 — Contexto

A Kawaii gera valor quando oportunidades se transformam em parcerias efetivas. Match, proposta, aceite e execução não são o mesmo evento.

## 2:00–5:00 — Duas dores, duas jornadas

- **Desafio 01 / equipe:** comunicação e ativação hoje manuais; solução proposta com segmentação e WhatsApp/e-mail, sem assumir monitoramento de grupos.
- **Desafio 02 / empreendedora:** matching e automação de propostas descritos como existentes mas desconectados; solução demonstrativa integrada por Adapter.

## 5:00–7:00 — Por que priorizar Desafio 02

O bloqueio match → proposta está explicitamente no enunciado, permite um fluxo funcional e fornece estados para automações posteriores. Se dados mostrarem gargalo diferente, rever prioridade.

## 7:00–13:00 — Demonstração

1. Abrir a versão React, fazer login de demonstração como **empreendedora**.
2. Filtrar recomendações por modalidade/relação com empresa.
3. Mostrar evidências confirmadas e inferidas e explicar por que não exibimos score probabilístico.
4. Selecionar a oportunidade, iniciar rascunho e revisar campos.
5. Repetir a intenção e demonstrar que retorna o mesmo rascunho.
6. Sair e entrar como **equipe**, consultar integrantes e permissões.
7. Agendar mensagem WhatsApp/e-mail sem envio real, processar envio simulado e distinguir `SENT` de `DELIVERED`.
8. Registrar check-in em um evento.

## 13:00–16:00 — Engenharia

React/TypeScript modular; NestJS como referência local; regras de domínio isoladas; adapters; contrato OpenAPI proposto; estados, idempotência e autorização futura no backend real; 19 testes automatizados locais.

## 16:00–18:00 — Limitações e próximos passos

Não existe integração real com Prisma, WhatsApp, e-mail ou motor legado. O pacote demonstra o fluxo com fixtures; integração de produção requer acesso, revisão de contratos e validações.

## 18:00–20:00 — Conclusão e perguntas

Métrica norte proposta: parcerias efetivas confirmadas/mês. Indicadores de suporte: conversão match→proposta, aceite, execução, ativação, presença, tempo manual e custo. Não afirmar ROI sem baseline.

## Checklist antes de apresentar

- Abrir `reference/prototipo-original.html` caso a instalação npm esteja indisponível.
- Para a versão React, instalar dependências e validar `npm run dev` e `npm run build` na própria máquina.
- Rodar `npm run test` e conferir console.
- Restaurar dados de demonstração antes de cada apresentação.
- Destacar o aviso “ambiente demonstrativo” e evitar qualquer aparência de envio real.
