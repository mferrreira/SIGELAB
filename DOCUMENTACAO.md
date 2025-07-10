# Documentação do Projeto - Plataforma Gamificada de Gerenciamento de Projetos para Laboratório Educacional

## Visão Geral
Este projeto é uma plataforma gamificada para o gerenciamento de projetos em um laboratório de pesquisa educacional do IFNMG. O sistema permite a criação de projetos, atribuição de tarefas a estudantes, acompanhamento de progresso, sistema de pontos e loja de recompensas, além de funcionalidades de calendário e controle de disponibilidade dos membros do laboratório.

## Funcionalidades Principais
- Cadastro e autenticação de usuários com diferentes papéis (admin, laboratorista, responsável, voluntário)
- Criação e gerenciamento de projetos e tarefas
- Sistema de pontos e ranking (leaderboard)
- Loja para resgate de recompensas
- Registro e acompanhamento de progresso diário
- Calendário compartilhado com disponibilidade e eventos
- Notificações e histórico de ações

## Fluxo de Autenticação e Cadastro
- O sistema utiliza autenticação segura baseada em NextAuth.js.
- As senhas dos usuários são armazenadas de forma segura, utilizando hash (bcrypt).
- O cadastro de novos usuários é feito via interface, com seleção do papel desejado. O pedido de cadastro deve ser aprovado por um laboratorista ou admin.
- Os papéis disponíveis são:
  - **admin**: Administrador do laboratório (criado apenas via backend)
  - **laboratorist**: Responsável pelo laboratório em determinados horários
  - **responsible**: Responsável por projetos
  - **volunteer**: Voluntário, pode ser atribuído a tarefas

## Segurança
- As senhas nunca são armazenadas em texto puro.
- O acesso às rotas e funcionalidades é controlado por autenticação e autorização baseada em papéis.

## Próximos Passos
- Atualizar o fluxo de login para utilizar NextAuth.js em toda a aplicação
- Implementar controle de acesso por papel nas rotas e páginas
- Documentar as demais funcionalidades à medida que forem implementadas

---

*Este documento será atualizado conforme o desenvolvimento do projeto avança.* 