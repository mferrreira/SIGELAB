import db from "./index"
import type { User } from "@/lib/types"

// Obter todos os usuários
export function getAllUsers(): User[] {
  return db.prepare("SELECT * FROM users").all() as User[]
}

// Obter um usuário pelo ID
export function getUserById(id: string): User | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined
}

// Obter um usuário pelo email
export function getUserByEmail(email: string): User | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined
}

// Criar um novo usuário
export function createUser(user: Omit<User, "id">): User {
  const id = Date.now().toString()

  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, role, points, completedTasks)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  stmt.run(id, user.name, user.email, user.role, user.points || 0, user.completedTasks || 0)

  return { id, ...user }
}

// Atualizar um usuário
export function updateUser(id: string, userData: Partial<User>): User | undefined {
  // Primeiro, verificar se o usuário existe
  const existingUser = getUserById(id)
  if (!existingUser) return undefined

  // Construir a consulta SQL dinamicamente com base nos campos fornecidos
  const updateFields: string[] = []
  const values: any[] = []

  if (userData.name !== undefined) {
    updateFields.push("name = ?")
    values.push(userData.name)
  }

  if (userData.email !== undefined) {
    updateFields.push("email = ?")
    values.push(userData.email)
  }

  if (userData.role !== undefined) {
    updateFields.push("role = ?")
    values.push(userData.role)
  }

  if (userData.points !== undefined) {
    updateFields.push("points = ?")
    values.push(userData.points)
  }

  if (userData.completedTasks !== undefined) {
    updateFields.push("completedTasks = ?")
    values.push(userData.completedTasks)
  }

  // Se não houver campos para atualizar, retornar o usuário existente
  if (updateFields.length === 0) return existingUser

  // Adicionar o ID ao final dos valores
  values.push(id)

  const stmt = db.prepare(`
    UPDATE users
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `)

  stmt.run(...values)

  // Retornar o usuário atualizado
  return getUserById(id)
}

// Adicionar pontos a um usuário
export function addPointsToUser(userId: string, points: number): User | undefined {
  const user = getUserById(userId)
  if (!user) return undefined

  const newPoints = user.points + points

  const stmt = db.prepare(`
    UPDATE users
    SET points = ?
    WHERE id = ?
  `)

  stmt.run(newPoints, userId)

  return getUserById(userId)
}

// Incrementar o contador de tarefas concluídas
export function incrementCompletedTasks(userId: string): User | undefined {
  const user = getUserById(userId)
  if (!user) return undefined

  const newCompletedTasks = user.completedTasks + 1

  const stmt = db.prepare(`
    UPDATE users
    SET completedTasks = ?
    WHERE id = ?
  `)

  stmt.run(newCompletedTasks, userId)

  return getUserById(userId)
}

// Excluir um usuário
export function deleteUser(id: string): boolean {
  const stmt = db.prepare("DELETE FROM users WHERE id = ?")
  const result = stmt.run(id)

  return result.changes > 0
}
