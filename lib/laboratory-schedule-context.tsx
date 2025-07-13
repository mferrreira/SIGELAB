"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { UsersAPI } from "@/lib/api-client"
import type { 
  LaboratorySchedule, 
  LaboratoryScheduleFormData, 
  LaboratoryScheduleContextType 
} from "@/lib/types"

const LaboratoryScheduleContext = createContext<LaboratoryScheduleContextType | undefined>(undefined)

export function LaboratoryScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<LaboratorySchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      setError(null)
      const { schedules } = await UsersAPI.getLaboratorySchedules()
      setSchedules(schedules)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar horários do laboratório")
      console.error("Erro ao buscar horários do laboratório:", err)
    } finally {
      setLoading(false)
    }
  }

  const createSchedule = async (scheduleData: LaboratoryScheduleFormData): Promise<LaboratorySchedule> => {
    try {
      setError(null)
      const { schedule } = await UsersAPI.createLaboratorySchedule(scheduleData)
      setSchedules(prev => [...prev, schedule])
      return schedule
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar horário"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateSchedule = async (id: number, scheduleData: Partial<LaboratorySchedule>): Promise<LaboratorySchedule> => {
    try {
      setError(null)
      const { schedule } = await UsersAPI.updateLaboratorySchedule(id, scheduleData)
      setSchedules(prev => prev.map(s => s.id === id ? schedule : s))
      return schedule
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar horário"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteSchedule = async (id: number): Promise<void> => {
    try {
      setError(null)
      await UsersAPI.deleteLaboratorySchedule(id)
      setSchedules(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao remover horário"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getSchedulesByDay = (dayOfWeek: number): LaboratorySchedule[] => {
    return schedules.filter(schedule => schedule.dayOfWeek === dayOfWeek)
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const value: LaboratoryScheduleContextType = {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDay,
  }

  return (
    <LaboratoryScheduleContext.Provider value={value}>
      {children}
    </LaboratoryScheduleContext.Provider>
  )
}

export function useLaboratorySchedule() {
  const context = useContext(LaboratoryScheduleContext)
  if (context === undefined) {
    throw new Error("useLaboratorySchedule deve ser usado dentro de um LaboratoryScheduleProvider")
  }
  return context
} 