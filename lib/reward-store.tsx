"use client"

import { create } from "zustand"
import type { Reward, Purchase } from "@/lib/types"
import { useUserStore } from "@/lib/user-store"

interface RewardStore {
  rewards: Reward[]
  purchases: Purchase[]
  addReward: (reward: Reward) => void
  updateReward: (id: string, data: Partial<Reward>) => void
  deleteReward: (id: string) => void
  purchaseReward: (userId: string, rewardId: string) => boolean
  updatePurchaseStatus: (purchaseId: string, status: Purchase["status"]) => void
  getUserPurchases: (userId: string) => Purchase[]
  initializeRewards: () => void
}

export const useRewardStore = create<RewardStore>((set, get) => ({
  rewards: [],
  purchases: [],

  addReward: (reward: Reward) =>
    set((state) => {
      const updatedRewards = [...state.rewards, reward]
      localStorage.setItem("rewards", JSON.stringify(updatedRewards))
      return { rewards: updatedRewards }
    }),

  updateReward: (id: string, data: Partial<Reward>) =>
    set((state) => {
      const updatedRewards = state.rewards.map((reward) => (reward.id === id ? { ...reward, ...data } : reward))
      localStorage.setItem("rewards", JSON.stringify(updatedRewards))
      return { rewards: updatedRewards }
    }),

  deleteReward: (id: string) =>
    set((state) => {
      const updatedRewards = state.rewards.filter((reward) => reward.id !== id)
      localStorage.setItem("rewards", JSON.stringify(updatedRewards))
      return { rewards: updatedRewards }
    }),

  purchaseReward: (userId: string, rewardId: string) => {
    const { rewards, purchases } = get()
    const reward = rewards.find((r) => r.id === rewardId)

    if (!reward || !reward.available) return false

    // Verificar se o usuário tem pontos suficientes
    const { users } = useUserStore.getState()
    const user = users.find((u) => u.id === userId)

    if (!user || user.points < reward.price) return false

    // Deduzir pontos do usuário
    useUserStore.getState().updateUser(userId, { points: user.points - reward.price })

    // Registrar a compra
    const newPurchase: Purchase = {
      id: Date.now().toString(),
      userId,
      rewardId,
      rewardName: reward.name,
      price: reward.price,
      purchaseDate: new Date().toISOString(),
      status: "pending",
    }

    set((state) => {
      const updatedPurchases = [...state.purchases, newPurchase]
      localStorage.setItem("purchases", JSON.stringify(updatedPurchases))
      return { purchases: updatedPurchases }
    })

    return true
  },

  updatePurchaseStatus: (purchaseId: string, status: Purchase["status"]) =>
    set((state) => {
      const updatedPurchases = state.purchases.map((purchase) =>
        purchase.id === purchaseId ? { ...purchase, status } : purchase,
      )
      localStorage.setItem("purchases", JSON.stringify(updatedPurchases))
      return { purchases: updatedPurchases }
    }),

  getUserPurchases: (userId: string) => {
    const { purchases } = get()
    return purchases.filter((p) => p.userId === userId)
  },

  initializeRewards: () => {
    // Carregar recompensas
    const storedRewards = localStorage.getItem("rewards")
    if (storedRewards) {
      set({ rewards: JSON.parse(storedRewards) })
    } else {
      // Adicionar algumas recompensas padrão
      const defaultRewards: Reward[] = [
        {
          id: "1",
          name: "Sair 10 minutos mais cedo",
          description: "Permissão para sair 10 minutos antes do horário normal em um dia à sua escolha.",
          price: 50,
          available: true,
        },
        {
          id: "2",
          name: "Utilizar o melhor computador",
          description: "Acesso ao computador de alta performance do laboratório por um dia inteiro.",
          price: 75,
          available: true,
        },
        {
          id: "3",
          name: "Acesso à chave do laboratório",
          description: "Permissão para ter acesso à chave do laboratório por uma semana.",
          price: 100,
          available: true,
        },
        {
          id: "4",
          name: "Dia de trabalho remoto",
          description: "Trabalhe de casa por um dia inteiro.",
          price: 150,
          available: true,
        },
        {
          id: "5",
          name: "Café da manhã especial",
          description: "Um café da manhã especial será providenciado para você e sua equipe.",
          price: 200,
          available: true,
        },
      ]
      localStorage.setItem("rewards", JSON.stringify(defaultRewards))
      set({ rewards: defaultRewards })
    }

    // Carregar compras
    const storedPurchases = localStorage.getItem("purchases")
    if (storedPurchases) {
      set({ purchases: JSON.parse(storedPurchases) })
    } else {
      localStorage.setItem("purchases", JSON.stringify([]))
      set({ purchases: [] })
    }
  },
}))
