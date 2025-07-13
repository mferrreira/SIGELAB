"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { UsersAPI } from "@/lib/api-client"
import { useSession, signIn, signOut } from "next-auth/react"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: "administrador_laboratorio" | "laboratorista" | "gerente_projeto" | "voluntario", weekHours: number) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const user = session?.user as User | null
  const loading = status === "loading"
  const error = null // NextAuth handles errors in the signIn result

  // O login agora é feito diretamente via signIn do NextAuth
  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", { redirect: false, email, password })
    if (result?.error) throw new Error(result.error)
  }

  // O logout agora é feito via signOut do NextAuth
  const logout = () => {
    signOut({ callbackUrl: "/login" })
  }

  // O registro permanece igual
  const register = async (name: string, email: string, password: string, role: "administrador_laboratorio" | "laboratorista" | "gerente_projeto" | "voluntario", weekHours: number) => {
    const normalizedEmail = email.toLowerCase()
    // Verificar se o usuário já existe
    const { users } = await UsersAPI.getAll()
    const existingUser = users.find((u) => u.email === normalizedEmail)
    if (existingUser) {
      throw new Error("Usuário já existe")
    }
    // Criar novo usuário
    const { user } = await UsersAPI.create({
      name,
      email: normalizedEmail,
      role,
      password,
      weekHours,
    })
    // Não fazer login automaticamente após o registro
    // O usuário precisa fazer login explicitamente
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
