"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { LabResponsibility, ActiveResponsibility } from "@/lib/types"
import { ResponsibilitiesAPI } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

interface ResponsibilityContextType {
  responsibilities: LabResponsibility[]
  activeResponsibility: ActiveResponsibility | null
  loading: boolean
  error: string | null
  fetchResponsibilities: (startDate?: string, endDate?: string) => Promise<void>
  fetchActiveResponsibility: () => Promise<void>
  startResponsibility: (notes?: string) => Promise<void>
  endResponsibility: () => Promise<void>
  updateNotes: (id: string, notes: string) => Promise<void>
  deleteResponsibility: (id: string) => Promise<void>
}

const ResponsibilityContext = createContext<ResponsibilityContextType | undefined>(undefined)

export function ResponsibilityProvider({ children }: { children: ReactNode }) {
  const [responsibilities, setResponsibilities] = useState<LabResponsibility[]>([])
  const [activeResponsibility, setActiveResponsibility] = useState<ActiveResponsibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Atualizar o tempo de duração da responsabilidade ativa a cada segundo
  useEffect(() => {
    if (!activeResponsibility) return

    const interval = setInterval(() => {
      setActiveResponsibility((prev) => {
        if (!prev) return null
        return {
          ...prev,
          duration: prev.duration + 1,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeResponsibility])

  const fetchResponsibilities = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)

      const { responsibilities } = await ResponsibilitiesAPI.getAll(startDate, endDate)
      setResponsibilities(responsibilities)
    } catch (err) {
      setError("Erro ao carregar responsabilidades")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActiveResponsibility = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { activeResponsibility } = await ResponsibilitiesAPI.getActive()
      setActiveResponsibility(activeResponsibility)
    } catch (err) {
      setError("Erro ao carregar responsabilidade ativa")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar dados quando o componente montar ou o usuário mudar
  useEffect(() => {
    if (user) {
      fetchResponsibilities()
      fetchActiveResponsibility()
    } else {
      setResponsibilities([])
      setActiveResponsibility(null)
    }
  }, [user, fetchResponsibilities, fetchActiveResponsibility])

  const startResponsibility = async (notes?: string) => {
    try {
      if (!user) throw new Error("Usuário não autenticado")

      setLoading(true)
      setError(null)

      const { responsibility } = await ResponsibilitiesAPI.start({
        userId: user.id,
        userName: user.name,
        notes,
      })

      // Atualizar a lista de responsabilidades
      setResponsibilities((prev) => [responsibility, ...prev])

      // Atualizar a responsabilidade ativa
      const startTime = new Date(responsibility.startTime).getTime()
      const now = new Date().getTime()
      const duration = Math.floor((now - startTime) / 1000)

      setActiveResponsibility({
        id: responsibility.id,
        userId: responsibility.userId,
        userName: responsibility.userName,
        startTime: responsibility.startTime,
        duration,
      })
    } catch (err) {
      setError("Erro ao iniciar responsabilidade")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const endResponsibility = async () => {
    try {
      if (!activeResponsibility) throw new Error("Não há responsabilidade ativa")

      setLoading(true)
      setError(null)

      const { responsibility } = await ResponsibilitiesAPI.end(activeResponsibility.id)

      // Atualizar a lista de responsabilidades
      setResponsibilities((prev) => prev.map((r) => (r.id === responsibility.id ? responsibility : r)))

      // Limpar a responsabilidade ativa
      setActiveResponsibility(null)
    } catch (err) {
      setError("Erro ao encerrar responsabilidade")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateNotes = async (id: string, notes: string) => {
    try {
      setLoading(true)
      setError(null)

      const { responsibility } = await ResponsibilitiesAPI.updateNotes(id, notes)

      // Atualizar a lista de responsabilidades
      setResponsibilities((prev) => prev.map((r) => (r.id === responsibility.id ? responsibility : r)))
    } catch (err) {
      setError("Erro ao atualizar notas")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteResponsibility = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      await ResponsibilitiesAPI.delete(id)

      // Atualizar a lista de responsabilidades
      setResponsibilities((prev) => prev.filter((r) => r.id !== id))

      // Se a responsabilidade ativa foi excluída, limpar
      if (activeResponsibility && activeResponsibility.id === id) {
        setActiveResponsibility(null)
      }
    } catch (err) {
      setError("Erro ao excluir responsabilidade")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <ResponsibilityContext.Provider
      value={{
        responsibilities,
        activeResponsibility,
        loading,
        error,
        fetchResponsibilities,
        fetchActiveResponsibility,
        startResponsibility,
        endResponsibility,
        updateNotes,
        deleteResponsibility,
      }}
    >
      {children}
    </ResponsibilityContext.Provider>
  )
}

export function useResponsibility() {
  const context = useContext(ResponsibilityContext)
  if (context === undefined) {
    throw new Error("useResponsibility deve ser usado dentro de um ResponsibilityProvider")
  }
  return context
}
