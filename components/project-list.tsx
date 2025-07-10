"use client"

import { useState } from "react"
import { useProject } from "@/lib/project-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectDialog } from "./project-dialog"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import type { Project } from "@/lib/types"

const statusColors = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  active: "Ativo",
  completed: "Concluído",
  archived: "Arquivado",
}

export function ProjectList() {
  const { user } = useAuth()
  const { projects, deleteProject, loading } = useProject()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setIsDialogOpen(true)
  }

  const handleDelete = async (projectId: string) => {
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      try {
        await deleteProject(projectId)
      } catch (error) {
        console.error("Erro ao excluir projeto:", error)
      }
    }
  }

  const handleCreateNew = () => {
    setSelectedProject(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedProject(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projetos</h2>
          <p className="text-muted-foreground">
            Gerencie os projetos do laboratório
          </p>
        </div>
        {user && (
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando seu primeiro projeto para organizar as atividades do laboratório.
            </p>
            {user && (
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Projeto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>
                      Criado em {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                    </CardDescription>
                  </div>
                                     <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                     {statusLabels[project.status as keyof typeof statusLabels]}
                   </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {project.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Criado por: {project.createdBy}
                  </div>
                  
                  {user && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(project)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        project={selectedProject}
      />
    </div>
  )
}
