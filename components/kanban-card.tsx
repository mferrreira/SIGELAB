"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, Clock, AlertTriangle, Trophy, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/types"
import { useUser } from "@/lib/user-context"
import { useProject } from "@/lib/project-context"
import { useTask } from "@/lib/task-context"
import { useAuth } from "@/lib/auth-context"
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

interface KanbanCardProps {
  task: Task
  onEdit: () => void
}

export function KanbanCard({ task, onEdit }: KanbanCardProps) {
  const { users } = useUser()
  const { projects } = useProject()
  const { completeTask, deleteTask } = useTask()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Encontrar usuário atribuído
  const assignedUser = users.find((u) => u.id === task.assignedTo)

  // Encontrar projeto
  const project = projects.find((p) => p.id === task.project)

  // Verificar se a tarefa está atrasada
  const isOverdue = () => {
    if (!task.dueDate) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Resetar horas para comparar apenas datas

    const dueDate = new Date(task.dueDate)

    // Tarefa está atrasada se a data de hoje é posterior à data limite
    // e a tarefa não está concluída
    return today > dueDate && task.status !== "done"
  }

  const overdueStatus = isOverdue()

  // Mapear prioridade para variante do badge
  const getPriorityBadge = () => {
    switch (task.priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>
      case "medium":
        return <Badge variant="default">Média</Badge>
      case "low":
        return <Badge variant="secondary">Baixa</Badge>
      default:
        return null
    }
  }

  // Marcar tarefa como concluída
  const handleCompleteTask = async () => {
    try {
      setIsLoading(true)
      await completeTask(task.id)
    } catch (error) {
      console.error("Erro ao completar tarefa:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Excluir tarefa
  const handleDeleteTask = async () => {
    try {
      setIsLoading(true)
      await deleteTask(task.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className={`shadow-sm ${overdueStatus ? "border-red-500 dark:border-red-400" : ""}`}>
        <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
          <h4 className="font-medium text-sm">{task.title}</h4>
          {/* Mostrar opções de editar/excluir apenas se o usuário for gerente ou a tarefa estiver atribuída a ele */}
          {(user?.role === "manager" || task.assignedTo === user?.id) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {task.status !== "done" && (
                  <DropdownMenuItem onClick={handleCompleteTask} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Concluir Tarefa
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onEdit} disabled={isLoading}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>

          <div className="mb-3 space-y-1">
            {project && (
              <div className="flex items-center text-xs">
                <span className="font-medium mr-1">Projeto:</span>
                <span className="text-muted-foreground">{project.name}</span>
              </div>
            )}
            {assignedUser && (
              <div className="flex items-center text-xs">
                <span className="font-medium mr-1">Atribuído a:</span>
                <span className="text-muted-foreground">{assignedUser.name}</span>
              </div>
            )}
            {task.points > 0 && (
              <div className="flex items-center text-xs">
                <span className="font-medium mr-1">Pontos:</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center">
                  <Trophy className="h-3 w-3 mr-1" />
                  {task.points}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getPriorityBadge()}
              {overdueStatus && (
                <Badge variant="outline" className="border-red-500 text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Atrasada
                </Badge>
              )}
            </div>
            {task.dueDate && (
              <div className="flex items-center text-xs">
                <Clock className={`h-3 w-3 mr-1 ${overdueStatus ? "text-red-500" : ""}`} />
                <span className={`text-xs ${overdueStatus ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a tarefa "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
