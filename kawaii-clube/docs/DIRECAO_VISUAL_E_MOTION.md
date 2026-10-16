# Identidade visual e motion design

## Princio geral

Kawaii Clube: **editorial, sóbrio, elegante, feminino sem estereótipos e operacionalmente claro**.

A fonte primária da marca é a **logo entregue pela usuária**, preservada em `apps/web/src/assets/logo-kawaii.png`. Ela tem resolução limitada; substituir por SVG oficial quando disponível. Nunca redesenhar o símbolo a partir de suposições.

## Paleta de referência da demo

| Uso | Cor | HEX | Observação |
|---|---|---|---|
| Vermelho institucional | Vermelho Kawaii | `#6A0004` | Extração visual aproximada do material enviado; conferir identidade oficial |
| Vermelho profundo | Deep red | `#4F0004` | Blocos escuros e contraste |
| Fundo editorial | Creme | `#F7F3EC` | Canvas claro |
| Cards | Marfim | `#FFFDF7` | Superfície para interface |
| Destaque moderado | Dourado | `#B18A57` | Evitar textos pequenos de baixo contraste |
| Texto | Carvão | `#282321` | Conteúdo funcional |
| Apoio | Taupe | `#756963` | Texto secundário |

> As cores, exceto as extraídas/aproximadas da logo, são **propostas de design**. Antes de integrar no repositório real, conferir `design-system.md`, estilos globais e tokens `data-plan` existentes.

## Tipografia

- Playfair Display (700): títulos, números, nomes em cards e títulos de fluxo/evento (itálico 400).
- Inter: corpo, labels, tabelas, formulários e ações.

**Atualização 16/10/2026:** o React passou a seguir o último HTML de referência (artifact “App de Parcerias e Painel do Clube”), que carrega Playfair Display + Inter. Antes, o React usava Cormorant Garamond, Bricolage Grotesque e Figtree. Tokens em `apps/web/src/styles/tokens.css`; o sistema começa claro e só escurece pelo botão de tema. Validar com o design system oficial antes de produção.

Observação de rastreabilidade: o HTML de referência definia essas famílias em seus tokens, mas carregava Inter/Playfair no cabeçalho. A versão React usa as famílias estabelecidas no planejamento da Kawaii e deve ser validada no repositório oficial.

## Distinção dos contextos

**Desafio 01 — Equipe:** dashboards, tabelas, filtros, indicadores e comunicação WhatsApp/e-mail. Motion mínimo; nenhum status simulado pode ser confundido com confirmação de envio real.

**Desafio 02 — Empreendedora:** cards de oportunidades, evidências dos matches, detalhes e formulário de proposta. Mais respiro editorial, reveals suaves e fluxo contínuo; a prioridade segue sendo acessibilidade e conversão da jornada.

## Motion tokens

- Hover: 160–220ms.
- Entrada de card: 220–320ms.
- Troca de contexto: 180–280ms.
- Mudança de etapa: 240–360ms.
- Feedback de sucesso: 250–450ms.
- `prefers-reduced-motion`: sempre respeitado.

Evitar bounce, animações longas, score “94% de sucesso” e motion repetido a cada refetch.

## Referências de padrões (não copiar telas)

- Brella: descoberta de matches e networking.
- Collabstr: estrutura de oportunidades e parcerias entre profissionais e marcas.
- PandaDoc: revisão e documentação de propostas.
- Customer.io: automações e campanhas.
- Circle: diretório e gestão da comunidade.
- Luma: eventos, inscrições e check-in.

É proibido usar imagens protegidas dessas plataformas como assets do produto sem autorização. As referências são de arquitetura de informação e padrões de interação.
