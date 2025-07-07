"use client"

import { useState, useEffect } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { KanbanColumn } from "@/components/kanban-column"
import { TaskDialog } from "@/components/task-dialog"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, Filter, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTask } from "@/lib/task-context"
import type { Task } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function KanbanBoard() {
  const { user } = useAuth()
  const { tasks, loading, error, fetchTasks, updateTask } = useTask()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Recarregar tarefas quando necessário
  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user, fetchTasks])

  const columns = [
    { id: "todo", title: "A Fazer" },
    { id: "in-progress", title: "Em Andamento" },
    { id: "in-review", title: "Em Revisão" },
    { id: "adjust", title: "Ajustes" },
    { id: "done", title: "Concluído" },
  ]

  // Verificar se uma tarefa está atrasada
  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dueDate = new Date(task.dueDate)

    return today > dueDate && task.status !== "done"
  }

  // Filtrar tarefas com base na função do usuário e filtro de atraso
  const filteredTasks = tasks
    .filter((task) => (user?.role === "manager" ? true : task.assignedTo === user?.id))
    .filter((task) => (showOverdueOnly ? isTaskOverdue(task) : true))

  // Contar tarefas atrasadas
  const overdueTasksCount = tasks
    .filter((task) => (user?.role === "manager" ? true : task.assignedTo === user?.id))
    .filter(isTaskOverdue).length

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Se não houver destino ou o item foi solto no mesmo lugar
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    try {
      setIsUpdating(true)

      // Encontrar a tarefa que foi arrastada
      const taskToUpdate = tasks.find((task) => task.id === draggableId)

      if (taskToUpdate) {
        // Atualizar seu status com base na coluna de destino
        await updateTask(draggableId, { status: destination.droppableId })
      }
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddTask = () => {
    setEditingTask(null)
    setIsDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Carregando tarefas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchTasks}>
          Tentar novamente
        </Button>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">{user?.role === "manager" ? "Todas as Tarefas" : "Minhas Tarefas"}</h2>

          {overdueTasksCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={showOverdueOnly ? "destructive" : "outline"} size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                  {overdueTasksCount > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs ${showOverdueOnly ? "bg-destructive-foreground text-destructive" : "bg-destructive text-destructive-foreground"}`}
                    >
                      {overdueTasksCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem checked={showOverdueOnly} onCheckedChange={setShowOverdueOnly}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Mostrar apenas atrasadas
                  </div>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Button onClick={handleAddTask} disabled={isUpdating}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tarefa
        </Button>
      </div>

      {isUpdating && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Atualizando...</span>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={filteredTasks.filter((task) => task.status === column.id)}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      </DragDropContext>

      <TaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} task={editingTask} />
    </div>
  )
}
