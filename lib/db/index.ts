import Database from "better-sqlite3"
import fs from "fs"
import path from "path"

// Garantir que o diretório de dados existe
const dbDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, "kanban.db")

// Inicializar o banco de dados
let db: Database.Database

try {
  db = new Database(dbPath)
  db.pragma("journal_mode = WAL")

  console.log("Conexão com o banco de dados SQLite estabelecida")

  // Inicializar tabelas
  initializeTables()
} catch (error) {
  console.error("Erro ao conectar ao banco de dados SQLite:", error)
  throw error
}

// Função para inicializar as tabelas do banco de dados
function initializeTables() {
  // Tabela de usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      points INTEGER DEFAULT 0,
      completedTasks INTEGER DEFAULT 0,
      password TEXT
    )
  `)

  // Tabela de projetos
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (createdBy) REFERENCES users (id)
    )
  `)

  // Tabela de tarefas
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      assignedTo TEXT,
      project TEXT,
      dueDate TEXT,
      points INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      FOREIGN KEY (assignedTo) REFERENCES users (id),
      FOREIGN KEY (project) REFERENCES projects (id)
    )
  `)

  // Tabela de recompensas
  db.exec(`
    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      available BOOLEAN DEFAULT 1
    )
  `)

  // Tabela de compras
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      rewardId TEXT NOT NULL,
      rewardName TEXT NOT NULL,
      price INTEGER NOT NULL,
      purchaseDate TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (rewardId) REFERENCES rewards (id)
    )
  `)

  // Tabela de responsabilidades do laboratório
  db.exec(`
    CREATE TABLE IF NOT EXISTS lab_responsibilities (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT,
      notes TEXT,
      FOREIGN KEY (userId) REFERENCES users (id)
    )
  `)

  // Verificar se já existem dados nas tabelas
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }

  // Se não houver usuários, inserir dados iniciais
  if (userCount.count === 0) {
    insertInitialData()
  }
}

// Função para inserir dados iniciais
function insertInitialData() {
  console.log("Inserindo dados iniciais no banco de dados...")

  // Inserir usuários iniciais
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, role, points, completedTasks)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const users = [
    { id: "1", name: "João Gerente", email: "gerente@exemplo.com", role: "manager", points: 0, completedTasks: 0 },
    { id: "2", name: "Alice Usuário", email: "alice@exemplo.com", role: "user", points: 120, completedTasks: 8 },
    { id: "3", name: "Roberto Usuário", email: "roberto@exemplo.com", role: "user", points: 85, completedTasks: 5 },
    { id: "4", name: "Carolina Usuário", email: "carolina@exemplo.com", role: "user", points: 150, completedTasks: 10 },
  ]

  users.forEach((user) => {
    insertUser.run(user.id, user.name, user.email, user.role, user.points, user.completedTasks)
  })

  // Inserir projetos iniciais
  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, description, createdAt, createdBy, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const projects = [
    {
      id: "1",
      name: "Redesign do Site",
      description: "Atualização completa do site corporativo",
      createdAt: new Date().toISOString(),
      createdBy: "1", // João Gerente
      status: "active",
    },
    {
      id: "2",
      name: "Correções de Bugs",
      description: "Correção de bugs reportados pelos usuários",
      createdAt: new Date().toISOString(),
      createdBy: "1",
      status: "active",
    },
    {
      id: "3",
      name: "Documentação",
      description: "Atualização da documentação técnica e de usuário",
      createdAt: new Date().toISOString(),
      createdBy: "1",
      status: "active",
    },
    {
      id: "4",
      name: "Atualizações de Segurança",
      description: "Implementação de melhorias de segurança",
      createdAt: new Date().toISOString(),
      createdBy: "1",
      status: "active",
    },
    {
      id: "5",
      name: "Desempenho",
      description: "Otimização de desempenho do sistema",
      createdAt: new Date().toISOString(),
      createdBy: "1",
      status: "completed",
    },
  ]

  projects.forEach((project) => {
    insertProject.run(
      project.id,
      project.name,
      project.description,
      project.createdAt,
      project.createdBy,
      project.status,
    )
  })

  // Inserir tarefas iniciais
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, assignedTo, project, dueDate, points, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const today = new Date()

  const tasks = [
    {
      id: "1",
      title: "Projetar nova página inicial",
      description: "Criar mockups para a nova campanha de marketing",
      status: "todo",
      priority: "high",
      assignedTo: "2", // Alice
      project: "1", // Redesign do Site
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 30,
      completed: 0,
    },
    {
      id: "2",
      title: "Corrigir bug de navegação",
      description: "Menu móvel não fecha ao clicar fora",
      status: "in-progress",
      priority: "medium",
      assignedTo: "3", // Roberto
      project: "2", // Correções de Bugs
      dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 20,
      completed: 0,
    },
    {
      id: "3",
      title: "Atualizar documentação do usuário",
      description: "Adicionar novos recursos ao guia do usuário",
      status: "in-review",
      priority: "low",
      assignedTo: "4", // Carolina
      project: "3", // Documentação
      dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 15,
      completed: 0,
    },
    {
      id: "4",
      title: "Implementar autenticação",
      description: "Adicionar funcionalidade de login e registro",
      status: "adjust",
      priority: "high",
      assignedTo: "2", // Alice
      project: "4", // Atualizações de Segurança
      dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 40,
      completed: 0,
    },
    {
      id: "5",
      title: "Otimizar consultas de banco de dados",
      description: "Melhorar desempenho do painel principal",
      status: "done",
      priority: "medium",
      assignedTo: "3", // Roberto
      project: "5", // Desempenho
      dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 25,
      completed: 1,
    },
    {
      id: "6",
      title: "Relatório de vendas mensal",
      description: "Compilar dados de vendas do mês anterior",
      status: "todo",
      priority: "high",
      assignedTo: "2", // Alice
      project: "1", // Redesign do Site
      dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 35,
      completed: 0,
    },
    {
      id: "7",
      title: "Atualizar plugins de segurança",
      description: "Instalar atualizações de segurança em todos os plugins",
      status: "in-progress",
      priority: "high",
      assignedTo: "3", // Roberto
      project: "4", // Atualizações de Segurança
      dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 30,
      completed: 0,
    },
  ]

  tasks.forEach((task) => {
    insertTask.run(
      task.id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.assignedTo,
      task.project,
      task.dueDate,
      task.points,
      task.completed,
    )
  })

  // Inserir recompensas iniciais
  const insertReward = db.prepare(`
    INSERT INTO rewards (id, name, description, price, available)
    VALUES (?, ?, ?, ?, ?)
  `)

  const rewards = [
    {
      id: "1",
      name: "Sair 10 minutos mais cedo",
      description: "Permissão para sair 10 minutos antes do horário normal em um dia à sua escolha.",
      price: 50,
      available: 1,
    },
    {
      id: "2",
      name: "Utilizar o melhor computador",
      description: "Acesso ao computador de alta performance do laboratório por um dia inteiro.",
      price: 75,
      available: 1,
    },
    {
      id: "3",
      name: "Acesso à chave do laboratório",
      description: "Permissão para ter acesso à chave do laboratório por uma semana.",
      price: 100,
      available: 1,
    },
    {
      id: "4",
      name: "Dia de trabalho remoto",
      description: "Trabalhe de casa por um dia inteiro.",
      price: 150,
      available: 1,
    },
    {
      id: "5",
      name: "Café da manhã especial",
      description: "Um café da manhã especial será providenciado para você e sua equipe.",
      price: 200,
      available: 1,
    },
  ]

  rewards.forEach((reward) => {
    insertReward.run(reward.id, reward.name, reward.description, reward.price, reward.available)
  })

  console.log("Dados iniciais inseridos com sucesso!")
}

export default db
