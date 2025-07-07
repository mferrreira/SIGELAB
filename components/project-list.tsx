"use client"

import { useState } from "react"
import { useProjectStore } from "@/lib/project-store"
import { useUserStore } from "@/lib/user-store"
import { useAuth } from "@/lib/auth-context"
import { ProjectDialog } from "@/components/project-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Archive, CheckCircle2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Project } from "@/lib/types"

export function ProjectList() {
  const { projects, updateProject, deleteProject } = useProjectStore()
  const { users } = useUserStore()
  const { user } = useAuth()

  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  // Ordenar projetos: ativos primeiro, depois concluídos, depois arquivados
  const sortedProjects = [...projects].sort((a, b) => {
    const statusOrder = { active: 0, completed: 1, archived: 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (projectId: string) => {
    setProjectToDelete(projectId)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete)
      setProjectToDelete(null)
    }
  }

  const handleStatusChange = (projectId: string, status: "active" | "completed" | "archived") => {
    updateProject(projectId, { status })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Ativo</Badge>
      case "completed":
        return (
          <Badge variant="success" className="bg-green-500">
            Concluído
          </Badge>
        )
      case "archived":
        return <Badge variant="secondary">Arquivado</Badge>
      default:
        return null
    }
  }

  // Encontrar o nome do criador do projeto
  const getCreatorName = (creatorId: string) => {
    const creator = users.find((user) => user.id === creatorId)
    return creator?.name || "Usuário desconhecido"
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado por</TableHead>
              <TableHead>Data de criação</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum projeto encontrado. Crie um novo projeto para começar.
                </TableCell>
              </TableRow>
            ) : (
              sortedProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>{getCreatorName(project.createdBy)}</TableCell>
                  <TableCell>{formatDate(project.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>

                        {project.status === "active" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project.id, "completed")}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Marcar como concluído
                          </DropdownMenuItem>
                        )}

                        {project.status !== "archived" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project.id, "archived")}>
                            <Archive className="h-4 w-4 mr-2" />
                            Arquivar
                          </DropdownMenuItem>
                        )}

                        {project.status !== "active" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(project.id, "active")}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Reativar
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => handleDelete(project.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} project={editingProject} />

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto e removerá os dados associados a
              ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
