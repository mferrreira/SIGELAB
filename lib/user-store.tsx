"use client"

import { create } from "zustand"
import type { User } from "@/lib/types"

interface UserStore {
  users: User[]
  addUser: (user: User) => void
  updateUser: (id: string, data: Partial<User>) => void
  addPointsToUser: (userId: string, points: number) => void
  incrementCompletedTasks: (userId: string) => void
  initializeUsers: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],

  addUser: (user: User) =>
    set((state) => {
      const updatedUsers = [...state.users, user]
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      return { users: updatedUsers }
    }),

  updateUser: (id: string, data: Partial<User>) =>
    set((state) => {
      const updatedUsers = state.users.map((user) => (user.id === id ? { ...user, ...data } : user))
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      return { users: updatedUsers }
    }),

  addPointsToUser: (userId: string, points: number) =>
    set((state) => {
      const updatedUsers = state.users.map((user) =>
        user.id === userId ? { ...user, points: user.points + points } : user,
      )
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      return { users: updatedUsers }
    }),

  incrementCompletedTasks: (userId: string) =>
    set((state) => {
      const updatedUsers = state.users.map((user) =>
        user.id === userId ? { ...user, completedTasks: user.completedTasks + 1 } : user,
      )
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      return { users: updatedUsers }
    }),

  initializeUsers: () => {
    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      // Atualizar usuários existentes para incluir novos campos se necessário
      const parsedUsers = JSON.parse(storedUsers)
      const updatedUsers = parsedUsers.map((user: User) => ({
        ...user,
        points: user.points || 0,
        completedTasks: user.completedTasks || 0,
      }))
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      set({ users: updatedUsers })
    } else {
      // Adicionar alguns usuários padrão se nenhum existir
      const defaultUsers: User[] = [
        { id: "1", name: "João Gerente", email: "gerente@exemplo.com", role: "manager", points: 0, completedTasks: 0 },
        { id: "2", name: "Alice Usuário", email: "alice@exemplo.com", role: "user", points: 120, completedTasks: 8 },
        { id: "3", name: "Roberto Usuário", email: "roberto@exemplo.com", role: "user", points: 85, completedTasks: 5 },
        {
          id: "4",
          name: "Carolina Usuário",
          email: "carolina@exemplo.com",
          role: "user",
          points: 150,
          completedTasks: 10,
        },
      ]
      localStorage.setItem("users", JSON.stringify(defaultUsers))
      set({ users: defaultUsers })
    }
  },
}))
