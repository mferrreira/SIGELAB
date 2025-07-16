"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/ui/task-form"
import { useUser } from "@/contexts/user-context"
import { useProject } from "@/contexts/project-context"
import { useTask } from "@/contexts/task-context"
import { useAuth } from "@/contexts/auth-context"
import { useState, useCallback } from "react"
import type { Task, TaskFormData } from "@/contexts/types"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Trash2 } from "lucide-react"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  projectId?: string
}

/**
 * Transforms form data to the format expected by the API
 */
const transformFormData = (formData: TaskFormData) => ({
  ...formData,
  assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
  projectId: formData.project ? parseInt(formData.project) : null,
})

/**
 * TaskDialog component for creating and editing tasks
 */
export function TaskDialog({ open, onOpenChange, task, projectId }: TaskDialogProps) {
  const { users } = useUser()
  const { projects } = useProject()
  const { createTask, updateTask, deleteTask } = useTask()
  const { user: currentUser } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = useCallback(async (formData: TaskFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const taskData = transformFormData(formData)

      if (task) {
        await updateTask(task.id, taskData)
      } else {
        await createTask(taskData)
      }

      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Erro ao salvar tarefa"
      
      setError(errorMessage)
      console.error("TaskDialog - Error saving task:", err)
    } finally {
      setIsSubmitting(false)
    }
  }, [task, createTask, updateTask, onOpenChange])

  const handleCancel = useCallback(() => {
    setError(null)
    onOpenChange(false)
  }, [onOpenChange])

  const handleDialogChange = useCallback((newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
    }
  }, [isSubmitting, onOpenChange])

  const canDelete = !!task && currentUser && [
    "gerente_projeto",
    "laboratorista",
    "administrador_laboratorio"
  ].includes(currentUser.role)

  const handleDelete = useCallback(async () => {
    if (!task) return
    if (!confirm("Tem certeza que deseja remover esta tarefa?")) return
    try {
      setIsDeleting(true)
      setError(null)
      await deleteTask(task.id)
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Erro ao remover tarefa"
      setError(errorMessage)
      console.error("TaskDialog - Error deleting task:", err)
    } finally {
      setIsDeleting(false)
    }
  }, [task, deleteTask, onOpenChange])

  const dialogTitle = task ? "Editar Tarefa" : "Adicionar Nova Tarefa"

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-2">
            {error}
          </Alert>
        )}

        <TaskForm
          key={open ? (task?.id ?? 'new') : 'closed'}
          task={task}
          users={users}
          projects={projects}
          currentUser={currentUser}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          error={error}
          projectId={projectId}
          open={open}
        />

        {/* Botão de remover tarefa, só aparece para papéis permitidos e se for edição */}
        {canDelete && (
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Removendo..." : "Remover Tarefa"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
