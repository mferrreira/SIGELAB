"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Task } from "@/lib/types"
import { TasksAPI } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createTask: (task: any) => Promise<Task>
  updateTask: (id: number, task: Partial<Task>) => Promise<Task>
  completeTask: (id: number) => Promise<Task>
  deleteTask: (id: number) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Pass user info for role-based filtering
      const params = user ? `?userId=${user.id}&role=${user.role}` : ""
      
      const response = await TasksAPI.getAll(params)
      const tasks = response?.tasks || []
      setTasks(tasks)
    } catch (err) {
      console.error("Task context - Error fetching tasks:", err)
      setError("Erro ao carregar tarefas")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchTasks()
    } else {
      setTasks([])
    }
  }, [user, fetchTasks])

  const createTask = async (taskData: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await TasksAPI.create(taskData)
      const task = response?.task
      if (task) {
        setTasks((prevTasks) => [...prevTasks, task])
        return task
      }
      throw new Error("Erro ao criar tarefa: resposta inválida")
    } catch (err) {
      setError("Erro ao criar tarefa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await TasksAPI.update(id, taskData)
      const task = response?.task
      if (task) {
        setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? task : t)))
        return task
      }
      throw new Error("Erro ao atualizar tarefa: resposta inválida")
    } catch (err) {
      setError("Erro ao atualizar tarefa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await TasksAPI.complete(id)
      const task = response?.task
      if (task) {
        setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? task : t)))
        return task
      }
      throw new Error("Erro ao completar tarefa: resposta inválida")
    } catch (err) {
      setError("Erro ao completar tarefa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id: number) => {
    try {
      setLoading(true)
      setError(null)

      await TasksAPI.delete(id)
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id))
    } catch (err) {
      setError("Erro ao excluir tarefa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        completeTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTask deve ser usado dentro de um TaskProvider")
  }
  return context
}
