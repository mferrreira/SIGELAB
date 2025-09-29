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
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const user = session?.user as User | null
  const loading = status === "loading"
  const error = null

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", { redirect: false, email, password })
    if (result?.error) throw new Error(result.error)
  }

  const logout = () => {
    signOut({ callbackUrl: "/login" })
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar conta')
    }

    return data
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
