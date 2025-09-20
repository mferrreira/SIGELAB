"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/contexts/types"
import { UsersAPI } from "@/contexts/api-client"
import { useSession, signIn, signOut } from "next-auth/react"
import type { UserRole } from "./types";

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, roles: UserRole[], weekHours: number) => Promise<void>
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
  const register = async (name: string, email: string, password: string, roles: UserRole[], weekHours: number) => {
    const normalizedEmail = email.toLowerCase()
    
    // Criar novo usuário diretamente
    // A verificação de usuário existente será feita no backend
    const { user } = await UsersAPI.create({
      name,
      email: normalizedEmail,
      roles,
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
