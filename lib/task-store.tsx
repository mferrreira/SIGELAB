"use client"

import { create } from "zustand"
import type { Task } from "@/lib/types"
import { useUserStore } from "@/lib/user-store"

interface TaskStore {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  completeTask: (taskId: string) => void
  initializeTasks: () => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  setTasks: (tasks: Task[]) => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
    set({ tasks })
  },

  completeTask: (taskId: string) => {
    const { tasks } = get()
    const task = tasks.find((t) => t.id === taskId)

    if (task && task.status !== "done") {
      // Marcar tarefa como concluída
      const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, status: "done", completed: true } : t))

      // Adicionar pontos ao usuário
      if (task.assignedTo && task.points > 0) {
        const userStore = useUserStore.getState()
        userStore.addPointsToUser(task.assignedTo, task.points)
        userStore.incrementCompletedTasks(task.assignedTo)
      }

      localStorage.setItem("tasks", JSON.stringify(updatedTasks))
      set({ tasks: updatedTasks })
    }
  },

  initializeTasks: () => {
    const storedTasks = localStorage.getItem("tasks")
    if (storedTasks) {
      // Atualizar tarefas existentes para incluir novos campos se necessário
      const parsedTasks = JSON.parse(storedTasks)
      const updatedTasks = parsedTasks.map((task: Task) => ({
        ...task,
        points: task.points || 0,
        completed: task.completed || false,
      }))
      localStorage.setItem("tasks", JSON.stringify(updatedTasks))
      set({ tasks: updatedTasks })
    } else {
      // Data atual para cálculos
      const today = new Date()

      // Adicionar algumas tarefas padrão se nenhuma existir
      const defaultTasks: Task[] = [
        {
          id: "1",
          title: "Projetar nova página inicial",
          description: "Criar mockups para a nova campanha de marketing",
          status: "todo",
          priority: "high",
          assignedTo: "2", // Alice
          project: "1", // Redesign do Site
          dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          points: 30,
          completed: false,
        },
        {
          id: "2",
          title: "Corrigir bug de navegação",
          description: "Menu móvel não fecha ao clicar fora",
          status: "in-progress",
          priority: "medium",
          assignedTo: "3", // Roberto
          project: "2", // Correções de Bugs
          dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          points: 20,
          completed: false,
        },
        {
          id: "3",
          title: "Atualizar documentação do usuário",
          description: "Adicionar novos recursos ao guia do usuário",
          status: "in-review",
          priority: "low",
          assignedTo: "4", // Carolina
          project: "3", // Documentação
          dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          points: 15,
          completed: false,
        },
        {
          id: "4",
          title: "Implementar autenticação",
          description: "Adicionar funcionalidade de login e registro",
          status: "adjust",
          priority: "high",
          assignedTo: "2", // Alice
          project: "4", // Atualizações de Segurança
          dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          points: 40,
          completed: false,
        },
        {
          id: "5",
          title: "Otimizar consultas de banco de dados",
          description: "Melhorar desempenho do painel principal",
          status: "done",
          priority: "medium",
          assignedTo: "3", // Roberto
          project: "5", // Desempenho
          dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          points: 25,
          completed: true,
        },
        // Adicionar algumas tarefas atrasadas para demonstração
        {
          id: "6",
          title: "Relatório de vendas mensal",
          description: "Compilar dados de vendas do mês anterior",
          status: "todo",
          priority: "high",
          assignedTo: "2", // Alice
          project: "1", // Redesign do Site
          dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          points: 35,
          completed: false,
        },
        {
          id: "7",
          title: "Atualizar plugins de segurança",
          description: "Instalar atualizações de segurança em todos os plugins",
          status: "in-progress",
          priority: "high",
          assignedTo: "3", // Roberto
          project: "4", // Atualizações de Segurança
          dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          points: 30,
          completed: false,
        },
      ]
      localStorage.setItem("tasks", JSON.stringify(defaultTasks))
      set({ tasks: defaultTasks })
    }
  },
}))
