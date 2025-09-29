"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { WorkSessionsAPI } from "@/contexts/api-client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/use-toast"
import type { WorkSession, WorkSessionFormData, WorkSessionContextType } from "@/contexts/types"

const WorkSessionContext = createContext<WorkSessionContextType | undefined>(undefined)

export function WorkSessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<WorkSession[]>([])
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSessions(user.id)
    } else {
      // Clear sessions when user logs out
      setSessions([])
      setActiveSession(null)
    }
  }, [user])

  const fetchSessions = async (userId?: number, status?: string) => {
    // Only fetch sessions for the current authenticated user
    const targetUserId = userId || user?.id
    if (!targetUserId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await WorkSessionsAPI.getAll(targetUserId, status)
      const fetchedSessions = Array.isArray(response) ? response : []
    
      setSessions(fetchedSessions)
      
      // Only set active session if it belongs to the current user
      const active = fetchedSessions.find((session: WorkSession) => 
        session && 
        session.status === "active" && 
        session.userId === targetUserId
      )
      setActiveSession(active || null)
    
    } catch (err) {
    
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar sessões"
      setError(errorMessage)

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startSession = async (sessionData: WorkSessionFormData): Promise<WorkSession> => {
    if (!user) throw new Error("Usuário não autenticado")
    
    setLoading(true)
    setError(null)
    
    try {
      // Ensure the session is created for the current user only
      const response = await WorkSessionsAPI.start({
        ...sessionData,
        userId: user.id, // Always use current user's ID
        userName: user.name, // Include user name
      })
      
      const newSession = response.data || response;
      console.log(newSession)
      setSessions(prev => [newSession, ...prev])
      setActiveSession(newSession)
      await fetchSessions(user.id)
      toast({
        title: "Sessão iniciada",
        description: "Timer de trabalho iniciado com sucesso!",
      })
      return newSession

    } catch (err: any) {
      let errorMessage = err.message || "Erro ao iniciar sessão"
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage += `: ${err.response.data.error}`
      }
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const endSession = async (id: number, activity?: string): Promise<WorkSession> => {
    if (!user) throw new Error("Usuário não autenticado")
    
    setLoading(true)
    setError(null)
    try {
      // Verify the session belongs to the current user
      const sessionToEnd = sessions.find(s => s.id === id)
      if (!sessionToEnd || sessionToEnd.userId !== user.id) {
        throw new Error("Sessão não encontrada ou não pertence ao usuário atual")
      }


      const response = await WorkSessionsAPI.update(id, {
        userId: user.id,
        status: "completed",
        endTime: new Date().toISOString(),
        activity,
      })

      const updatedSession = response.data
      setSessions(prev => prev.map(session => session.id === id ? updatedSession : session))
      setActiveSession(null)
      await fetchSessions(user.id)
      toast({
        title: "Sessão finalizada",
        description: "Timer de trabalho finalizado com sucesso!",
      })
      return updatedSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao finalizar sessão"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const pauseSession = async (id: number): Promise<WorkSession> => {
    if (!user) throw new Error("Usuário não autenticado")
    
    setLoading(true)
    setError(null)
    try {
      // Verify the session belongs to the current user
      const sessionToPause = sessions.find(s => s.id === id)
      if (!sessionToPause || sessionToPause.userId !== user.id) {
        throw new Error("Sessão não encontrada ou não pertence ao usuário atual")
      }

      const response = await WorkSessionsAPI.update(id, {
        status: "paused",
      })
      const updatedSession = response.data
      setSessions(prev => prev.map(session => session.id === id ? updatedSession : session))
      setActiveSession(null)

      await fetchSessions(user.id)
      
      toast({
        title: "Sessão pausada",
        description: "Timer de trabalho pausado com sucesso!",
      })
      return updatedSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao pausar sessão"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resumeSession = async (id: number): Promise<WorkSession> => {
    if (!user) throw new Error("Usuário não autenticado")
    
    setLoading(true)
    setError(null)
    try {
      // Verify the session belongs to the current user
      const sessionToResume = sessions.find(s => s.id === id)
      if (!sessionToResume || sessionToResume.userId !== user.id) {
        throw new Error("Sessão não encontrada ou não pertence ao usuário atual")
      }

      const response = await WorkSessionsAPI.update(id, {
        status: "active",
      })
      const updatedSession = response.data
      setSessions(prev => prev.map(session => session.id === id ? updatedSession : session))
      setActiveSession(updatedSession)
      await fetchSessions(user.id)
      toast({
        title: "Sessão retomada",
        description: "Timer de trabalho retomado com sucesso!",
      })
      return updatedSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao retomar sessão"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateSession = async (id: number, data: Partial<WorkSession>): Promise<WorkSession> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await WorkSessionsAPI.update(id, data)
      
      const updatedSession = response.data
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ))
      
      if (updatedSession.status === "active") {
        setActiveSession(updatedSession)
      } else if (activeSession?.id === id) {
        setActiveSession(null)
      }
      
      return updatedSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar sessão"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async (id: number): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      await WorkSessionsAPI.delete(id)
      
      setSessions(prev => prev.filter(session => session.id !== id))
      
      if (activeSession?.id === id) {
        setActiveSession(null)
      }
      
      toast({
        title: "Sessão excluída",
        description: "Sessão de trabalho excluída com sucesso!",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao excluir sessão"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getActiveSession = (userId: number): WorkSession | null => {
    return sessions.find(session => session.userId === userId && session.status === "active") || null
  }

  const getWeeklyHours = async (userId: number, weekStart: string, weekEnd: string): Promise<number> => {
    try {
      // Calcular horas a partir das sessões completadas na semana atual
      const weekStartDate = new Date(weekStart);
      const weekEndDate = new Date(weekEnd);
      
      // Filtrar sessões completadas dentro do período da semana
      const completedSessions = sessions.filter(session => 
        session &&
        session.userId === userId &&
        session.status === 'completed' &&
        session.startTime &&
        session.duration &&
        new Date(session.startTime) >= weekStartDate &&
        new Date(session.startTime) <= weekEndDate
      );
      
      // Somar as durações das sessões (já estão em horas)
      const totalHours = completedSessions.reduce((sum, session) => {
        return sum + (session.duration || 0);
      }, 0);
      
      return totalHours;
    } catch (error) {
      console.error('Erro ao calcular horas semanais:', error);
      return 0;
    }
  };

  const value: WorkSessionContextType = {
    sessions,
    activeSession,
    loading,
    error,
    fetchSessions,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateSession,
    deleteSession,
    getActiveSession,
    getWeeklyHours,
  }

  return (
    <WorkSessionContext.Provider value={value}>
      {children}
    </WorkSessionContext.Provider>
  )
}

export function useWorkSessions(): WorkSessionContextType {
  const context = useContext(WorkSessionContext)
  if (context === undefined) {
    throw new Error("useWorkSessions must be used within a WorkSessionProvider")
  }
  return context
} 