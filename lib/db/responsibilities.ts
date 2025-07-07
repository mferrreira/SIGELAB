import db from "./index"
import type { LabResponsibility } from "@/lib/types"

// Obter todas as responsabilidades
export function getAllResponsibilities(): LabResponsibility[] {
  return db.prepare("SELECT * FROM lab_responsibilities ORDER BY startTime DESC").all() as LabResponsibility[]
}

// Obter responsabilidades por período
export function getResponsibilitiesByPeriod(startDate: string, endDate: string): LabResponsibility[] {
  return db
    .prepare(
      `SELECT * FROM lab_responsibilities 
       WHERE (startTime BETWEEN ? AND ?) OR (endTime BETWEEN ? AND ?) OR (startTime <= ? AND (endTime IS NULL OR endTime >= ?))
       ORDER BY startTime DESC`,
    )
    .all(startDate, endDate, startDate, endDate, startDate, endDate) as LabResponsibility[]
}

// Obter responsabilidades por usuário
export function getResponsibilitiesByUser(userId: string): LabResponsibility[] {
  return db
    .prepare("SELECT * FROM lab_responsibilities WHERE userId = ? ORDER BY startTime DESC")
    .all(userId) as LabResponsibility[]
}

// Obter responsabilidade ativa (sem endTime)
export function getActiveResponsibility(): LabResponsibility | undefined {
  return db.prepare("SELECT * FROM lab_responsibilities WHERE endTime IS NULL").get() as LabResponsibility | undefined
}

// Iniciar uma nova responsabilidade
export function startResponsibility(userId: string, userName: string, notes?: string): LabResponsibility {
  // Verificar se já existe uma responsabilidade ativa
  const activeResponsibility = getActiveResponsibility()
  if (activeResponsibility) {
    // Encerrar a responsabilidade ativa antes de iniciar uma nova
    endResponsibility(activeResponsibility.id)
  }

  const id = Date.now().toString()
  const startTime = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO lab_responsibilities (id, userId, userName, startTime, notes)
    VALUES (?, ?, ?, ?, ?)
  `)

  stmt.run(id, userId, userName, startTime, notes || null)

  return {
    id,
    userId,
    userName,
    startTime,
    endTime: null,
    notes,
  }
}

// Encerrar uma responsabilidade
export function endResponsibility(id: string): LabResponsibility | undefined {
  const responsibility = db.prepare("SELECT * FROM lab_responsibilities WHERE id = ?").get(id) as
    | LabResponsibility
    | undefined

  if (!responsibility) return undefined

  const endTime = new Date().toISOString()

  const stmt = db.prepare(`
    UPDATE lab_responsibilities
    SET endTime = ?
    WHERE id = ?
  `)

  stmt.run(endTime, id)

  return {
    ...responsibility,
    endTime,
  }
}

// Atualizar notas de uma responsabilidade
export function updateResponsibilityNotes(id: string, notes: string): LabResponsibility | undefined {
  const responsibility = db.prepare("SELECT * FROM lab_responsibilities WHERE id = ?").get(id) as
    | LabResponsibility
    | undefined

  if (!responsibility) return undefined

  const stmt = db.prepare(`
    UPDATE lab_responsibilities
    SET notes = ?
    WHERE id = ?
  `)

  stmt.run(notes, id)

  return {
    ...responsibility,
    notes,
  }
}

// Excluir uma responsabilidade
export function deleteResponsibility(id: string): boolean {
  const stmt = db.prepare("DELETE FROM lab_responsibilities WHERE id = ?")
  const result = stmt.run(id)

  return result.changes > 0
}
