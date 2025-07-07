"use client"

import { create } from "zustand"
import type { Project } from "@/lib/types"

interface ProjectStore {
  projects: Project[]
  addProject: (project: Project) => void
  updateProject: (id: string, updatedProject: Partial<Project>) => void
  deleteProject: (id: string) => void
  initializeProjects: () => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],

  addProject: (project: Project) =>
    set((state) => {
      const updatedProjects = [...state.projects, project]
      localStorage.setItem("projects", JSON.stringify(updatedProjects))
      return { projects: updatedProjects }
    }),

  updateProject: (id: string, updatedProject: Partial<Project>) =>
    set((state) => {
      const updatedProjects = state.projects.map((project) =>
        project.id === id ? { ...project, ...updatedProject } : project,
      )
      localStorage.setItem("projects", JSON.stringify(updatedProjects))
      return { projects: updatedProjects }
    }),

  deleteProject: (id: string) =>
    set((state) => {
      const updatedProjects = state.projects.filter((project) => project.id !== id)
      localStorage.setItem("projects", JSON.stringify(updatedProjects))
      return { projects: updatedProjects }
    }),

  initializeProjects: () => {
    const storedProjects = localStorage.getItem("projects")
    if (storedProjects) {
      set({ projects: JSON.parse(storedProjects) })
    } else {
      // Adicionar alguns projetos padrão se nenhum existir
      const defaultProjects: Project[] = [
        {
          id: "1",
          name: "Redesign do Site",
          description: "Atualização completa do site corporativo",
          createdAt: new Date().toISOString(),
          createdBy: "1", // João Gerente
          status: "active",
        },
        {
          id: "2",
          name: "Correções de Bugs",
          description: "Correção de bugs reportados pelos usuários",
          createdAt: new Date().toISOString(),
          createdBy: "1", // João Gerente
          status: "active",
        },
        {
          id: "3",
          name: "Documentação",
          description: "Atualização da documentação técnica e de usuário",
          createdAt: new Date().toISOString(),
          createdBy: "1", // João Gerente
          status: "active",
        },
        {
          id: "4",
          name: "Atualizações de Segurança",
          description: "Implementação de melhorias de segurança",
          createdAt: new Date().toISOString(),
          createdBy: "1", // João Gerente
          status: "active",
        },
        {
          id: "5",
          name: "Desempenho",
          description: "Otimização de desempenho do sistema",
          createdAt: new Date().toISOString(),
          createdBy: "1", // João Gerente
          status: "completed",
        },
      ]
      localStorage.setItem("projects", JSON.stringify(defaultProjects))
      set({ projects: defaultProjects })
    }
  },
}))
