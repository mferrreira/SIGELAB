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
  createTask: (task: Omit<Task, "id">) => Promise<Task>
  updateTask: (id: string, task: Partial<Task>) => Promise<Task>
  completeTask: (id: string) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
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

      const { tasks } = await TasksAPI.getAll()
      setTasks(tasks)
    } catch (err) {
      setError("Erro ao carregar tarefas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar tarefas quando o componente montar ou o usuário mudar
  useEffect(() => {
    if (user) {
      fetchTasks()
    } else {
      setTasks([])
    }
  }, [user, fetchTasks])

  const createTask = async (taskData: Omit<Task, "id">) => {
    try {
      setLoading(true)
      setError(null)

      const { task } = await TasksAPI.create(taskData)
      setTasks((prevTasks) => [...prevTasks, task])
      return task
    } catch (err) {
      setError("Erro ao criar tarefa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      setLoading(true)
      setError(null)

      const { task } = await TasksAPI.update(id, taskData)
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? task : t)))
      return task
    } catch (err) {
      setError("Erro ao atualizar tarefa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const completeTask = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { task } = await TasksAPI.complete(id)
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? task : t)))
      return task
    } catch (err) {
      setError("Erro ao completar tarefa")
      console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id: string) => {
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
