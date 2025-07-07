"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/lib/types"
import { useUser } from "@/lib/user-context"
import { useProject } from "@/lib/project-context"
import { useTask } from "@/lib/task-context"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, Trophy, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const { users } = useUser()
  const { projects } = useProject()
  const { createTask, updateTask } = useTask()
  const { user: currentUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
    project: "",
    dueDate: "",
    points: 0,
    completed: false,
  })

  // Estado para verificar se a data selecionada já passou
  const [isPastDate, setIsPastDate] = useState(false)

  // Resetar formulário quando o diálogo abre/fecha ou a tarefa muda
  useEffect(() => {
    if (open && task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        project: task.project,
        dueDate: task.dueDate || "",
        points: task.points,
        completed: task.completed || false,
      })
      checkIfPastDate(task.dueDate)
    } else if (open) {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignedTo: currentUser?.role === "user" ? currentUser.id : "",
        project: "",
        dueDate: "",
        points: 10,
        completed: false,
      })
      setIsPastDate(false)
    }

    setError(null)
  }, [open, task, currentUser])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Verificar se a data selecionada já passou
    if (name === "dueDate") {
      checkIfPastDate(value)
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const checkIfPastDate = (dateString?: string) => {
    if (!dateString) {
      setIsPastDate(false)
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Resetar horas para comparar apenas datas

    const selectedDate = new Date(dateString)

    setIsPastDate(selectedDate < today)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePointsChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, points: value[0] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      if (task) {
        // Atualizar tarefa existente
        await updateTask(task.id, formData)
      } else {
        // Adicionar nova tarefa
        await createTask(formData)
      }

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar tarefa")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filtrar apenas projetos ativos
  const activeProjects = projects.filter((project) => project.status === "active")

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isSubmitting && onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? "Editar Tarefa" : "Adicionar Nova Tarefa"}</DialogTitle>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="in-review">Em Revisão</SelectItem>
                    <SelectItem value="adjust">Ajustes</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Atribuído a</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => handleSelectChange("assignedTo", value)}
                disabled={currentUser?.role === "user"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project">Projeto</Label>
              <Select value={formData.project} onValueChange={(value) => handleSelectChange("project", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  {activeProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Data de Entrega</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
              {isPastDate && (
                <Alert variant="warning" className="mt-2 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Atenção: A data selecionada já passou. A tarefa será marcada como atrasada.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Campo de pontos - apenas visível para gerentes */}
            {currentUser?.role === "manager" && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="points" className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Pontos da Tarefa
                  </Label>
                  <span className="text-sm font-medium">{formData.points}</span>
                </div>
                <Slider
                  id="points"
                  min={0}
                  max={100}
                  step={5}
                  value={[formData.points]}
                  onValueChange={handlePointsChange}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">
                  Defina quantos pontos o usuário receberá ao completar esta tarefa.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {task ? "Salvar Alterações" : "Adicionar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
