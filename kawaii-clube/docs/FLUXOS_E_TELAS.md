# Funcionalidades e telas — produto final vs. protótipo

## Desafio 01: equipe Kawaii (admin)

| Tela | Funcionalidade prevista | Implementação nesta demo |
|---|---|---|
| Dashboard | KPIs, alertas, etapas de jornada | Sim, dados fictícios |
| Integrantes | Pesquisa, filtros, status, contatos autorizados | Sim |
| Detalhe da integrante | Histórico, preferência e ação contextual | Sim, agendamento fictício |
| Comunicações | WhatsApp/e-mail, templates, fila, status, falha | Sim, agendamento e processamento simulados |
| Automações | D0 / D3 / D5 / D7, condições e opt-out | Representação interativa; sem execução automática |
| Eventos | Calendário/lista, inscritos, presença | Lista + check-in manual fictício |
| Relatórios | Participação, entregas, cobertura, custos | Indicadores demonstrativos, sem dinheiro inventado |

### Jornada-alvo

Novo cadastro → evento persistido → validar autorização por canal → segmentar → agendar comunicação → provedor WhatsApp/email → webhook/status → acompanhar perfil e evento → identificar necessidade de ação → painel.

**Não fazemos envios reais.** O canal preferido deve estar permitido; não interpretar ausência de abertura de e-mail como desinteresse. Tratar WhatsApp oficial para conversas individuais, não presumir leitura de grupos.

## Desafio 02: empreendedora (user)

| Tela | Funcionalidade prevista | Implementação nesta demo |
|---|---|---|
| Início | Jornada, sugestões e ações | Sim |
| Perfil | Ofertas, necessidades, preferências | Formulário demonstrativo persistido localmente; não atualiza matching mock |
| Central | Busca, filtros por modalidades e empresas | Sim |
| Detalhes do match | Parceira, evidências e contexto | Sim |
| Criar proposta | Adapter, preenchimento, revisão | Sim, contrato mock |
| Minhas propostas | Histórico de rascunhos e estados | Sim, somente rascunhos e revisão |
| Detalhes da parceria | Negociação, aceite bilateral e execução | Planejado, não implementado |

### Jornada MVP

Consulta → match elegível → evidências → clique para gerar → revalidação no domínio → chave de idempotência → rascunho → edição com versão → revisão → acompanhamento local.

Cenários: permuta entre confeitaria e fotografia, apoio com finanças, collab de kits e oportunidade empresarial de fornecimento. O relacionamento empresarial aparece separado da modalidade.

## Critérios globais de UX

- Direção editorial sóbria com identidade Kawaii; microanimações discretas.
- Responsivo: lateral desktop / navegação inferior mobile.
- Estados de carregamento, vazio, erro, sucesso e operações ocupadas.
- Textos acessíveis, foco por teclado e `prefers-reduced-motion`.
- Não comunicar match como probabilidade de sucesso.
- Não confirmar operações externas por mera animação.

## Critérios de aceitação demonstráveis

1. Usuária abre match ativo e rascunho pré-preenchido.
2. Retentativa com a mesma chave retorna rascunho já criado.
3. Uma alteração na versão do rascunho invalida atualização obsoleta.
4. Equipe encontra integrante por nome/área e filtra jornada.
5. Sem consentimento em nenhum canal, o agendamento é bloqueado.
6. Template ativo duplicado ou frequência excedida bloqueia nova comunicação.
7. Mensagem agendada pode ser cancelada ou processada no simulador.
8. `SENT` permanece diferente de `DELIVERED`.
9. Check-in repetido é bloqueado.
10. Nenhuma operação da demo envia WhatsApp/e-mail real.
