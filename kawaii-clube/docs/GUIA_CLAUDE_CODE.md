# Como continuar o desafio com Claude Code

## 1. Prepare o projeto

Descompacte o ZIP, abra a pasta raiz no VS Code ou Claude Code e execute `npm install` e `npm run dev`. O HTML original continua independente em `reference/prototipo-original.html`.

## 2. Skill principal

`frontend-design` para composição e motion editorial, mas primeiro leia `AGENTS.md`, `docs/ARQUITETURA.md`, `docs/FLUXOS_E_TELAS.md` e a interface existente. Não reescreva o código sem justificativa.

## 3. Prompt de continuidade

> Analise todo o repositório Kawaii Clube entregue em ZIP antes de editar. Preserve as fronteiras entre domínio, aplicação, apresentação e mocks e o padrão de Clean Code descrito em `AGENTS.md`. A marca utiliza o vermelho institucional #6A0004, creme #F7F3EC, marfim #FFFDF7, dourado restrito #B18A57, com Playfair Display e Inter no último HTML de referência. Concilie qualquer divergência com o design system oficial antes de aplicar alterações definitivas.
>
> Priorize no App da empreendedora o fluxo Oportunidades → Evidências → Rascunho → Revisão; no painel da equipe, gestão de integrantes, WhatsApp/e-mail, jornadas e eventos. Sem envios reais ou autenticação aparente sem backend. Use mocks identificados até validar a API verdadeira. Melhore acessibilidade, performance, estados, responsividade, tipagem e testes. Antes de codificar, entregue um plano curto e o inventário de arquivos a modificar; depois execute testes e relate limitações.

## 4. Observações

- Este ZIP não contém dependências npm (`node_modules`).
- Não remover o original `reference/prototipo-original.html`; é a evidência de layout anterior.
- A API NestJS local é apenas um exemplo de implementação de contratos, **não** um backend integrado ao front-end demonstrativo.
