import db from "./index"
import type { Project } from "@/lib/types"

// Obter todos os projetos
export function getAllProjects(): Project[] {
  return db.prepare("SELECT * FROM projects").all() as Project[]
}

// Obter um projeto pelo ID
export function getProjectById(id: string): Project | undefined {
  return db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as Project | undefined
}

// Criar um novo projeto
export function createProject(project: Omit<Project, "id">): Project {
  const id = Date.now().toString()

  const stmt = db.prepare(`
    INSERT INTO projects (id, name, description, createdAt, createdBy, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  stmt.run(id, project.name, project.description || "", project.createdAt, project.createdBy, project.status)

  return { id, ...project }
}

// Atualizar um projeto
export function updateProject(id: string, projectData: Partial<Project>): Project | undefined {
  // Primeiro, verificar se o projeto existe
  const existingProject = getProjectById(id)
  if (!existingProject) return undefined

  // Construir a consulta SQL dinamicamente com base nos campos fornecidos
  const updateFields: string[] = []
  const values: any[] = []

  if (projectData.name !== undefined) {
    updateFields.push("name = ?")
    values.push(projectData.name)
  }

  if (projectData.description !== undefined) {
    updateFields.push("description = ?")
    values.push(projectData.description)
  }

  if (projectData.status !== undefined) {
    updateFields.push("status = ?")
    values.push(projectData.status)
  }

  // Se não houver campos para atualizar, retornar o projeto existente
  if (updateFields.length === 0) return existingProject

  // Adicionar o ID ao final dos valores
  values.push(id)

  const stmt = db.prepare(`
    UPDATE projects
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `)

  stmt.run(...values)

  // Retornar o projeto atualizado
  return getProjectById(id)
}

// Excluir um projeto
export function deleteProject(id: string): boolean {
  const stmt = db.prepare("DELETE FROM projects WHERE id = ?")
  const result = stmt.run(id)

  return result.changes > 0
}
