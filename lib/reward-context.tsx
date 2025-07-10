"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Reward, Purchase } from "@/lib/types"
import { RewardsAPI, PurchasesAPI } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

interface RewardContextType {
  rewards: Reward[]
  purchases: Purchase[]
  loading: boolean
  error: string | null
  fetchRewards: () => Promise<void>
  fetchPurchases: (userId?: number) => Promise<void>
  createReward: (reward: Omit<Reward, "id">) => Promise<Reward>
  updateReward: (id: number, reward: Partial<Reward>) => Promise<Reward>
  deleteReward: (id: number) => Promise<void>
  purchaseReward: (userId: number, rewardId: number) => Promise<Purchase | null>
  updatePurchaseStatus: (id: number, status: Purchase["status"]) => Promise<Purchase>
}

const RewardContext = createContext<RewardContextType | undefined>(undefined)

export function RewardProvider({ children }: { children: ReactNode }) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { rewards } = await RewardsAPI.getAll()
      setRewards(rewards)
    } catch (err) {
      setError("Erro ao carregar recompensas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPurchases = useCallback(async (userId?: number) => {
    try {
      setLoading(true)
      setError(null)

      const { purchases } = await PurchasesAPI.getAll(userId)
      setPurchases(purchases)
    } catch (err) {
      setError("Erro ao carregar compras")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar recompensas e compras quando o componente montar ou o usuário mudar
  useEffect(() => {
    if (user) {
      fetchRewards()
      fetchPurchases(Number(user.id))
    } else {
      setRewards([])
      setPurchases([])
    }
  }, [user, fetchRewards, fetchPurchases])

  const createReward = async (rewardData: Omit<Reward, "id">) => {
    try {
      setLoading(true)
      setError(null)

      const { reward } = await RewardsAPI.create(rewardData)
      setRewards((prevRewards) => [...prevRewards, reward])
      return reward
    } catch (err) {
      setError("Erro ao criar recompensa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateReward = async (id: number, rewardData: Partial<Reward>) => {
    try {
      setLoading(true)
      setError(null)

      const { reward } = await RewardsAPI.update(id, rewardData)
      setRewards((prevRewards) => prevRewards.map((r) => (r.id === id ? reward : r)))
      return reward
    } catch (err) {
      setError("Erro ao atualizar recompensa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteReward = async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      await RewardsAPI.delete(id)
      setRewards((prevRewards) => prevRewards.filter((r) => r.id !== id))
    } catch (err) {
      setError("Erro ao excluir recompensa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const purchaseReward = async (userId: number, rewardId: number) => {
    try {
      setLoading(true)
      setError(null)

      const { purchase } = await PurchasesAPI.create({ userId, rewardId })
      setPurchases((prevPurchases) => [...prevPurchases, purchase])

      // Atualizar a lista de recompensas para refletir qualquer mudança
      await fetchRewards()

      return purchase
    } catch (err) {
      setError("Erro ao comprar recompensa")
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updatePurchaseStatus = async (id: number, status: Purchase["status"]) => {
    try {
      setLoading(true)
      setError(null)

      const { purchase } = await PurchasesAPI.updateStatus(id, status)
      setPurchases((prevPurchases) => prevPurchases.map((p) => (p.id === id ? purchase : p)))
      return purchase
    } catch (err) {
      setError("Erro ao atualizar status da compra")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <RewardContext.Provider
      value={{
        rewards,
        purchases,
        loading,
        error,
        fetchRewards,
        fetchPurchases,
        createReward,
        updateReward,
        deleteReward,
        purchaseReward,
        updatePurchaseStatus,
      }}
    >
      {children}
    </RewardContext.Provider>
  )
}

export function useReward() {
  const context = useContext(RewardContext)
  if (context === undefined) {
    throw new Error("useReward deve ser usado dentro de um RewardProvider")
  }
  return context
}
