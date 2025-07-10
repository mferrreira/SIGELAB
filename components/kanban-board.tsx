"use client"

import { useState, useEffect, useMemo } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { KanbanColumn } from "@/components/ui/kanban-column"
import { TaskDialog } from "@/components/task-dialog"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle, Filter, Loader2, CheckCircle } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

const COLUMNS = [
  { id: "todo", title: "A Fazer" },
  { id: "in-progress", title: "Em Andamento" },
  { id: "in-review", title: "Em Revisão" },
  { id: "adjust", title: "Ajustes" },
  { id: "done", title: "Concluído" },
]

export function KanbanBoard() {
  const { user } = useAuth()
  const { tasks, loading, error, fetchTasks, updateTask } = useTask()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([])

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user, fetchTasks])

  // Update optimistic tasks when tasks change
  useEffect(() => {
    setOptimisticTasks(tasks)
  }, [tasks])

  // Memoize overdue status for each task
  const overdueStatusMap = useMemo(() => {
    const map: { [id: string]: boolean } = {}
    optimisticTasks.forEach((task) => {
      map[task.id] = isTaskOverdue(task)
    })
    return map
  }, [optimisticTasks])

  // Filter tasks based on user role and overdue filter
  const filteredTasks = useMemo(() => {
    return optimisticTasks
      .filter((task) => (user?.role === "responsible" ? true : task.assignedTo === user?.id))
      .filter((task) => (showOverdueOnly ? overdueStatusMap[task.id] : true))
  }, [optimisticTasks, user, showOverdueOnly, overdueStatusMap])

  // Count overdue tasks
  const overdueTasksCount = useMemo(() => {
    return optimisticTasks
      .filter((task) => (user?.role === "responsible" ? true : task.assignedTo === user?.id))
      .filter((task) => overdueStatusMap[task.id]).length
  }, [optimisticTasks, user, overdueStatusMap])

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    try {
      setIsUpdating(true)
      const taskToUpdate = optimisticTasks.find((task) => task.id.toString() === draggableId)
      
      if (taskToUpdate) {
        const previousStatus = taskToUpdate.status
        const newStatus = destination.droppableId
        
        // Optimistically update the UI immediately
        const updatedTask = { ...taskToUpdate, status: newStatus }
        setOptimisticTasks(prev => 
          prev.map(task => 
            task.id === taskToUpdate.id ? updatedTask : task
          )
        )

        // Then update the backend
        const result = await updateTask(taskToUpdate.id, { status: newStatus })
        
        // Show success message if points were awarded
        if (newStatus === "done" && previousStatus !== "done" && taskToUpdate.points > 0 && taskToUpdate.assignedTo) {
          toast({
            title: "🎉 Tarefa Concluída!",
            description: `${taskToUpdate.points} pontos foram adicionados ao perfil do responsável.`,
            variant: "default",
          })
        }
        
        // Refresh tasks to ensure consistency
        await fetchTasks()
      }
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error)
      // Revert optimistic update on error
      await fetchTasks()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Quadro Kanban</h2>
          {overdueTasksCount > 0 && (
            <div className="flex items-center text-orange-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span className="text-sm hidden sm:inline">{overdueTasksCount} tarefa(s) atrasada(s)</span>
              <span className="text-sm sm:hidden">{overdueTasksCount}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={showOverdueOnly}
                onCheckedChange={setShowOverdueOnly}
              >
                Mostrar apenas atrasadas
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleAddTask} disabled={isUpdating}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nova Tarefa</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMNS.map((column) => (
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

// Helper function to check if a task is overdue
function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(task.dueDate)
  return today > dueDate && task.status !== "done"
}
