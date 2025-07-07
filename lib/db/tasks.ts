import db from "./index"
import type { Task } from "@/lib/types"
import { addPointsToUser, incrementCompletedTasks } from "./users"

// Obter todas as tarefas
export function getAllTasks(): Task[] {
  return db.prepare("SELECT * FROM tasks").all() as Task[]
}

// Obter uma tarefa pelo ID
export function getTaskById(id: string): Task | undefined {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined
}

// Obter tarefas por usuário
export function getTasksByUser(userId: string): Task[] {
  return db.prepare("SELECT * FROM tasks WHERE assignedTo = ?").all(userId) as Task[]
}

// Criar uma nova tarefa
export function createTask(task: Omit<Task, "id">): Task {
  const id = Date.now().toString()

  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, assignedTo, project, dueDate, points, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    task.title,
    task.description || "",
    task.status,
    task.priority,
    task.assignedTo,
    task.project || null,
    task.dueDate || null,
    task.points || 0,
    task.completed ? 1 : 0,
  )

  return { id, ...task }
}

// Atualizar uma tarefa
export function updateTask(id: string, taskData: Partial<Task>): Task | undefined {
  // Primeiro, verificar se a tarefa existe
  const existingTask = getTaskById(id)
  if (!existingTask) return undefined

  // Construir a consulta SQL dinamicamente com base nos campos fornecidos
  const updateFields: string[] = []
  const values: any[] = []

  if (taskData.title !== undefined) {
    updateFields.push("title = ?")
    values.push(taskData.title)
  }

  if (taskData.description !== undefined) {
    updateFields.push("description = ?")
    values.push(taskData.description)
  }

  if (taskData.status !== undefined) {
    updateFields.push("status = ?")
    values.push(taskData.status)
  }

  if (taskData.priority !== undefined) {
    updateFields.push("priority = ?")
    values.push(taskData.priority)
  }

  if (taskData.assignedTo !== undefined) {
    updateFields.push("assignedTo = ?")
    values.push(taskData.assignedTo)
  }

  if (taskData.project !== undefined) {
    updateFields.push("project = ?")
    values.push(taskData.project)
  }

  if (taskData.dueDate !== undefined) {
    updateFields.push("dueDate = ?")
    values.push(taskData.dueDate)
  }

  if (taskData.points !== undefined) {
    updateFields.push("points = ?")
    values.push(taskData.points)
  }

  if (taskData.completed !== undefined) {
    updateFields.push("completed = ?")
    values.push(taskData.completed ? 1 : 0)
  }

  // Se não houver campos para atualizar, retornar a tarefa existente
  if (updateFields.length === 0) return existingTask

  // Adicionar o ID ao final dos valores
  values.push(id)

  const stmt = db.prepare(`
    UPDATE tasks
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `)

  stmt.run(...values)

  // Retornar a tarefa atualizada
  return getTaskById(id)
}

// Marcar uma tarefa como concluída
export function completeTask(id: string): Task | undefined {
  const task = getTaskById(id)
  if (!task || task.status === "done" || task.completed) return task

  // Atualizar a tarefa
  const stmt = db.prepare(`
    UPDATE tasks
    SET status = 'done', completed = 1
    WHERE id = ?
  `)

  stmt.run(id)

  // Adicionar pontos ao usuário
  if (task.assignedTo && task.points > 0) {
    addPointsToUser(task.assignedTo, task.points)
    incrementCompletedTasks(task.assignedTo)
  }

  return getTaskById(id)
}

// Excluir uma tarefa
export function deleteTask(id: string): boolean {
  const stmt = db.prepare("DELETE FROM tasks WHERE id = ?")
  const result = stmt.run(id)

  return result.changes > 0
}
