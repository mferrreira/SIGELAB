# 🧪 Plataforma de Gerenciamento de Laboratórios Educacionais

Uma plataforma gamificada completa para gerenciamento de projetos, tarefas e recursos em laboratórios educacionais do IFNMG.

## 🚀 Funcionalidades Principais

### 👥 Gestão de Usuários
- **Sistema de Autenticação**: Login seguro com NextAuth.js
- **Papéis Hierárquicos**: Admin, Laboratorista, Gerente de Projeto, Voluntário
- **Aprovação de Usuários**: Controle de acesso com aprovação manual
- **Perfis Personalizados**: Pontos, tarefas completadas, horários

### 📋 Gestão de Projetos
- **Criação de Projetos**: Interface intuitiva para novos projetos
- **Membros de Projeto**: Sistema de convites e participação
- **Kanban Board**: Visualização e gestão de tarefas por status
- **Progresso em Tempo Real**: Acompanhamento de conclusão

### 🎯 Sistema de Tarefas
- **Atribuição Inteligente**: Tarefas por usuário ou projeto
- **Sistema de Pontos**: Gamificação com pontuação por tarefa
- **Prioridades**: Baixa, Média, Alta
- **Prazos**: Controle de datas de entrega
- **Status Dinâmicos**: To-do, In Progress, In Review, Adjust, Done

### 🏆 Gamificação
- **Sistema de Pontos**: Acumulação por tarefas completadas
- **Loja de Recompensas**: Resgate de pontos por benefícios
- **Aprovação de Compras**: Controle laboratorista/admin
- **Leaderboard**: Ranking de usuários por pontos

### 📅 Calendário e Agendamento
- **Responsabilidades do Lab**: Controle de horários de responsabilidade
- **Agenda Compartilhada**: Visualização de eventos e disponibilidade
- **Logs Diários**: Registro de atividades por projeto
- **Relatórios Semanais**: Resumos automáticos de progresso

### ⏱️ Controle de Tempo
- **Sessões de Trabalho**: Timer para atividades
- **Logs de Atividade**: Registro detalhado de tempo
- **Relatórios de Produtividade**: Análise de horas trabalhadas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos

### Backend
- **Next.js API Routes** - API RESTful
- **Prisma ORM** - Acesso type-safe ao banco
- **PostgreSQL** - Banco de dados relacional
- **NextAuth.js** - Autenticação segura
- **bcryptjs** - Hash de senhas

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **PostgreSQL** - Banco de dados

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 12+
- Docker (opcional)

### 1. Clone o Repositório
```bash
git clone <repository-url>
cd jogos-main
```

### 2. Instale as Dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as Variáveis de Ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lab_management"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configure o Banco de Dados
```bash
# Execute as migrações
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate
```

### 5. Execute o Projeto
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🐳 Docker (Opcional)

### Desenvolvimento
```bash
docker-compose -f docker-compose.dev.yml up
```

### Produção
```bash
docker-compose up -d
```

## 🏗️ Estrutura do Projeto

```
jogos-main/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Páginas do dashboard
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── *.tsx             # Componentes específicos
├── lib/                   # Utilitários e configurações
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth-context.tsx  # Contexto de autenticação
│   └── types.ts          # Tipos TypeScript
├── prisma/               # Schema e migrações
│   └── schema.prisma     # Schema do banco
└── public/               # Arquivos estáticos
```

## 👤 Papéis e Permissões

### 🔧 Admin
- Acesso total ao sistema
- Gestão de usuários e aprovações
- Configurações do laboratório
- Relatórios completos

### 🧪 Laboratorista
- Gestão de responsabilidades
- Aprovação de compras na loja
- Gestão de projetos e tarefas
- Controle de horários

### 📊 Gerente de Projeto
- Gestão de projetos próprios
- Atribuição de tarefas
- Acompanhamento de membros
- Relatórios de projeto

### 👨‍🎓 Voluntário
- Visualização de tarefas atribuídas
- Registro de logs diários
- Participação em projetos
- Resgate de recompensas

## 🔒 Segurança

- **Autenticação**: NextAuth.js com JWT
- **Hash de Senhas**: bcryptjs
- **Controle de Acesso**: Baseado em papéis
- **Validação**: TypeScript + Zod
- **HTTPS**: Recomendado para produção

## 📊 Monitoramento

### Métricas Disponíveis
- Usuários ativos por período
- Tarefas completadas
- Pontos distribuídos
- Tempo de sessão
- Produtividade por projeto

### Logs
- Logs de autenticação
- Logs de ações administrativas
- Logs de erros
- Logs de performance

## 🚀 Deploy

### Requisitos Mínimos
- **CPU**: 2-4 vCPUs
- **RAM**: 4-8 GB
- **Storage**: 50-100 GB SSD
- **Network**: 1 Gbps

### Plataformas Recomendadas
- **Vercel** + **Railway** (Managed)
- **DigitalOcean** Droplet
- **AWS EC2** + **RDS**
- **Google Cloud Platform**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento
- Consulte a documentação técnica

---

**Desenvolvido para o IFNMG - Instituto Federal do Norte de Minas Gerais** 🎓 