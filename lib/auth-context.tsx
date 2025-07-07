"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { UsersAPI } from "@/lib/api-client"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: "user" | "manager") => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar usuário logado no carregamento inicial
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Em uma implementação real, você faria uma chamada para verificar a sessão
        // Por exemplo: const response = await fetch('/api/auth/session')

        // Para esta demonstração, vamos verificar se há um ID de usuário armazenado
        const storedUserId = sessionStorage.getItem("currentUserId")

        if (storedUserId) {
          try {
            const { user } = await UsersAPI.getById(storedUserId)
            setUser(user)
          } catch (err) {
            // Se o usuário não for encontrado, limpar a sessão
            sessionStorage.removeItem("currentUserId")
            console.error("Erro ao buscar usuário:", err)
          }
        }
      } catch (err) {
        console.error("Erro ao verificar sessão:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // Em uma implementação real, você faria uma chamada de API para autenticar
      // Por exemplo: const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

      // Para esta demonstração, vamos buscar todos os usuários e encontrar o que corresponde ao email
      const { users } = await UsersAPI.getAll()
      const user = users.find((u) => u.email === email)

      if (!user) {
        throw new Error("Usuário não encontrado")
      }

      // Em um aplicativo real, verificaríamos o hash da senha
      // Para esta demonstração, estamos apenas verificando se o usuário existe

      // Salvar ID do usuário na sessão
      sessionStorage.setItem("currentUserId", user.id)
      setUser(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao fazer login")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: "user" | "manager") => {
    try {
      setLoading(true)
      setError(null)

      // Verificar se o usuário já existe
      const { users } = await UsersAPI.getAll()
      const existingUser = users.find((u) => u.email === email)

      if (existingUser) {
        throw new Error("Usuário já existe")
      }

      // Criar novo usuário
      const { user } = await UsersAPI.create({
        name,
        email,
        role,
        // Em um aplicativo real, você faria hash da senha antes de enviá-la
        // password: hashedPassword
      })

      // Não fazer login automaticamente após o registro
      // O usuário precisa fazer login explicitamente
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao registrar")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem("currentUserId")
    setUser(null)
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
