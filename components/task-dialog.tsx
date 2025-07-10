"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/ui/task-form"
import { useUser } from "@/lib/user-context"
import { useProject } from "@/lib/project-context"
import { useTask } from "@/lib/task-context"
import { useAuth } from "@/lib/auth-context"
import { useState, useCallback } from "react"
import type { Task, TaskFormData } from "@/lib/types"

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
  project: formData.project ? parseInt(formData.project) : null,
})

/**
 * TaskDialog component for creating and editing tasks
 */
export function TaskDialog({ open, onOpenChange, task, projectId }: TaskDialogProps) {
  const { users } = useUser()
  const { projects } = useProject()
  const { createTask, updateTask } = useTask()
  const { user: currentUser } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const dialogTitle = task ? "Editar Tarefa" : "Adicionar Nova Tarefa"

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <TaskForm
          task={task}
          users={users}
          projects={projects}
          currentUser={currentUser}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          error={error}
          projectId={projectId}
        />
      </DialogContent>
    </Dialog>
  )
}
