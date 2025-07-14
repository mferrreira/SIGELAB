"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { UserSchedule, UserScheduleFormData } from "@/contexts/types"
import { SchedulesAPI } from "@/contexts/api-client"
import { useAuth } from "@/contexts/auth-context"

interface ScheduleContextType {
  schedules: UserSchedule[]
  loading: boolean
  error: string | null
  fetchSchedules: (userId?: number) => Promise<void>
  createSchedule: (schedule: UserScheduleFormData) => Promise<UserSchedule>
  updateSchedule: (id: number, schedule: Partial<UserSchedule>) => Promise<UserSchedule>
  deleteSchedule: (id: number) => Promise<void>
  getSchedulesByDay: (dayOfWeek: number) => UserSchedule[]
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined)

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedules, setSchedules] = useState<UserSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSchedules = useCallback(async (userId?: number) => {
    try {
      setLoading(true)
      setError(null)

      const { schedules } = await SchedulesAPI.getAll(userId)
      setSchedules(schedules)
    } catch (err) {
      setError("Erro ao carregar horários")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar horários quando o componente montar
  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  const createSchedule = async (scheduleData: UserScheduleFormData) => {
    try {
      setLoading(true)
      setError(null)

      const { schedule } = await SchedulesAPI.create(scheduleData)
      setSchedules((prevSchedules) => [...prevSchedules, schedule])
      return schedule
    } catch (err) {
      setError("Erro ao criar horário")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateSchedule = async (id: number, scheduleData: Partial<UserSchedule>) => {
    try {
      setLoading(true)
      setError(null)

      const { schedule } = await SchedulesAPI.update(id, scheduleData)
      setSchedules((prevSchedules) => prevSchedules.map((s) => (s.id === id ? schedule : s)))
      return schedule
    } catch (err) {
      setError("Erro ao atualizar horário")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteSchedule = async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      await SchedulesAPI.delete(id)
      setSchedules((prevSchedules) => prevSchedules.filter((s) => s.id !== id))
    } catch (err) {
      setError("Erro ao excluir horário")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getSchedulesByDay = (dayOfWeek: number) => {
    return schedules.filter((schedule) => schedule.dayOfWeek === dayOfWeek)
  }

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading,
        error,
        fetchSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        getSchedulesByDay,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  )
}

export function useSchedule() {
  const context = useContext(ScheduleContext)
  if (context === undefined) {
    throw new Error("useSchedule deve ser usado dentro de um ScheduleProvider")
  }
  return context
} 