import db from "./index"
import type { Reward, Purchase } from "@/lib/types"
import { getUserById } from "./users"

// Obter todas as recompensas
export function getAllRewards(): Reward[] {
  return db.prepare("SELECT * FROM rewards").all() as Reward[]
}

// Obter uma recompensa pelo ID
export function getRewardById(id: string): Reward | undefined {
  return db.prepare("SELECT * FROM rewards WHERE id = ?").get(id) as Reward | undefined
}

// Criar uma nova recompensa
export function createReward(reward: Omit<Reward, "id">): Reward {
  const id = Date.now().toString()

  const stmt = db.prepare(`
    INSERT INTO rewards (id, name, description, price, available)
    VALUES (?, ?, ?, ?, ?)
  `)

  stmt.run(id, reward.name, reward.description || "", reward.price, reward.available ? 1 : 0)

  return { id, ...reward }
}

// Atualizar uma recompensa
export function updateReward(id: string, rewardData: Partial<Reward>): Reward | undefined {
  // Primeiro, verificar se a recompensa existe
  const existingReward = getRewardById(id)
  if (!existingReward) return undefined

  // Construir a consulta SQL dinamicamente com base nos campos fornecidos
  const updateFields: string[] = []
  const values: any[] = []

  if (rewardData.name !== undefined) {
    updateFields.push("name = ?")
    values.push(rewardData.name)
  }

  if (rewardData.description !== undefined) {
    updateFields.push("description = ?")
    values.push(rewardData.description)
  }

  if (rewardData.price !== undefined) {
    updateFields.push("price = ?")
    values.push(rewardData.price)
  }

  if (rewardData.available !== undefined) {
    updateFields.push("available = ?")
    values.push(rewardData.available ? 1 : 0)
  }

  // Se não houver campos para atualizar, retornar a recompensa existente
  if (updateFields.length === 0) return existingReward

  // Adicionar o ID ao final dos valores
  values.push(id)

  const stmt = db.prepare(`
    UPDATE rewards
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `)

  stmt.run(...values)

  // Retornar a recompensa atualizada
  return getRewardById(id)
}

// Excluir uma recompensa
export function deleteReward(id: string): boolean {
  const stmt = db.prepare("DELETE FROM rewards WHERE id = ?")
  const result = stmt.run(id)

  return result.changes > 0
}

// Obter todas as compras
export function getAllPurchases(): Purchase[] {
  return db.prepare("SELECT * FROM purchases").all() as Purchase[]
}

// Obter compras por usuário
export function getPurchasesByUser(userId: string): Purchase[] {
  return db.prepare("SELECT * FROM purchases WHERE userId = ?").all(userId) as Purchase[]
}

// Obter uma compra pelo ID
export function getPurchaseById(id: string): Purchase | undefined {
  return db.prepare("SELECT * FROM purchases WHERE id = ?").get(id) as Purchase | undefined
}

// Criar uma nova compra (resgatar recompensa)
export function purchaseReward(userId: string, rewardId: string): Purchase | false {
  // Verificar se a recompensa existe e está disponível
  const reward = getRewardById(rewardId)
  if (!reward || !reward.available) return false

  // Verificar se o usuário existe
  const user = getUserById(userId)
  if (!user) return false

  // Verificar se o usuário tem pontos suficientes
  if (user.points < reward.price) return false

  // Iniciar transação
  const transaction = db.transaction(() => {
    // Deduzir pontos do usuário
    const updateUserStmt = db.prepare(`
      UPDATE users
      SET points = ?
      WHERE id = ?
    `)

    updateUserStmt.run(user.points - reward.price, userId)

    // Criar registro de compra
    const id = Date.now().toString()
    const purchaseDate = new Date().toISOString()

    const insertPurchaseStmt = db.prepare(`
      INSERT INTO purchases (id, userId, rewardId, rewardName, price, purchaseDate, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    insertPurchaseStmt.run(id, userId, rewardId, reward.name, reward.price, purchaseDate, "pending")

    return id
  })

  try {
    const purchaseId = transaction()
    return getPurchaseById(purchaseId) as Purchase
  } catch (error) {
    console.error("Erro ao processar compra:", error)
    return false
  }
}

// Atualizar o status de uma compra
export function updatePurchaseStatus(id: string, status: Purchase["status"]): Purchase | undefined {
  // Verificar se a compra existe
  const purchase = getPurchaseById(id)
  if (!purchase) return undefined

  const stmt = db.prepare(`
    UPDATE purchases
    SET status = ?
    WHERE id = ?
  `)

  stmt.run(status, id)

  // Retornar a compra atualizada
  return getPurchaseById(id)
}
