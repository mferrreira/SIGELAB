"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import { KanbanColumn } from "@/components/ui/kanban-column"
import { KanbanHeader } from "@/components/ui/kanban-header"
import { TaskDialog } from "@/components/features/task-dialog"
import { Loader2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTask } from "@/contexts/task-context"
import type { Task } from "@/contexts/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/contexts/use-toast"
import { hasAccess } from "@/lib/utils/utils"

const COLUMNS = [
  { id: "to-do", status: "to-do" },
  { id: "in-progress", status: "in-progress" },
  { id: "in-review", status: "in-review" },
  { id: "adjust", status: "adjust" },
  { id: "done", status: "done" },
]

export function KanbanBoard() {
  const { user } = useAuth()
  const { tasks, loading, error, fetchTasks, updateTask, completeTask } = useTask()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([])

  // Load tasks when user changes - optimized with useCallback
  const loadTasks = useCallback(() => {
    if (user) {
      fetchTasks()
    }
  }, [user, fetchTasks])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Update optimistic tasks when tasks change
  useEffect(() => {
    setOptimisticTasks(tasks || [])
  }, [tasks])

  // Memoize overdue status for each task - optimized computation
  const overdueStatusMap = useMemo(() => {
    const map: { [id: string]: boolean } = {}
    if (optimisticTasks?.length > 0) {
      optimisticTasks.forEach((task) => {
        if (task?.id) {
          map[task.id] = isTaskOverdue(task)
        }
      })
    }
    return map
  }, [optimisticTasks])

  // Filter tasks based on overdue filter only (role-based filtering is now handled by backend)
  const filteredTasks = useMemo(() => {
    if (!optimisticTasks || !Array.isArray(optimisticTasks)) {
      return []
    }
    return optimisticTasks.filter((task) => (showOverdueOnly ? overdueStatusMap[task.id] : true))
  }, [optimisticTasks, showOverdueOnly, overdueStatusMap])

  // Count overdue tasks
  const overdueTasksCount = useMemo(() => {
    if (!optimisticTasks || !Array.isArray(optimisticTasks)) {
      return 0
    }
    return optimisticTasks.filter((task) => overdueStatusMap[task.id]).length
  }, [optimisticTasks, overdueStatusMap])

  // Check if user can create tasks
  const canCreateTasks = hasAccess(user?.roles || [], 'MANAGE_TASKS')

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Early return if no destination or same position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Prevent dragging tasks out of 'done' unless user is a project leader
    const isLeader = hasAccess(user?.roles || [], 'MANAGE_TASKS')
    if (source.droppableId === "done" && !isLeader) {
      // Optionally show a toast or message
      toast({
        title: "Ação não permitida",
        description: "Apenas líderes de projeto podem mover tarefas concluídas.",
        variant: "destructive",
      });
      return;
    }

    // Prevent default behavior that might cause page reload
    if (result.reason === 'DROP') {
      // Add a small delay to ensure the drop animation completes
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    try {
      setIsUpdating(true)
      if (!optimisticTasks || !Array.isArray(optimisticTasks)) {
        console.error("optimisticTasks is not available")
        return
      }
      const taskToUpdate = optimisticTasks.find((task) => task.id.toString() === draggableId)
      
      if (taskToUpdate) {
        const previousStatus = taskToUpdate.status
        const newStatus = destination.droppableId as "to-do" | "in-progress" | "in-review" | "adjust" | "done"
        
        // Optimistically update the UI immediately
        const updatedTask = { ...taskToUpdate, status: newStatus }
        setOptimisticTasks(prev => {
          if (!prev || !Array.isArray(prev)) {
            return [updatedTask]
          }
          return prev.map(task => 
            task.id === taskToUpdate.id ? updatedTask : task
          )
        })

        // Prepare update data
        const updateData: any = { status: newStatus }
        
        // For public tasks being moved to done, assign to the current user if they're a volunteer
        if (newStatus === "done" && taskToUpdate.taskVisibility === "public" && !taskToUpdate.assignedTo && user && hasAccess(user.roles || [], 'COMPLETE_PUBLIC_TASKS')) {
          updateData.assignedTo = user.id.toString()
        }
        
        // Then update the backend
        if (newStatus === "done") {
          await completeTask(taskToUpdate.id)
        } else {
          await updateTask(taskToUpdate.id, updateData)
        }
        
        // Show success message if points were awarded
        if (newStatus === "done" && previousStatus !== "done" && taskToUpdate.points > 0) {
          const userToAward = taskToUpdate.assignedTo || (taskToUpdate.taskVisibility === "public" && hasAccess(user?.roles || [], 'COMPLETE_PUBLIC_TASKS') ? user?.id : null)
          if (userToAward) {
            toast({
              title: "🎉 Tarefa Concluída!",
              description: `${taskToUpdate.points} pontos foram adicionados ao perfil do responsável.`,
              variant: "default",
            })
          }
        }
        
        // Don't refresh tasks here - the optimistic update is sufficient
        // Only refresh if there's an error
      }
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error)
      // Revert optimistic update on error by refreshing tasks
      await fetchTasks()
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da tarefa. Tente novamente.",
        variant: "destructive",
      })
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
      <KanbanHeader
        overdueCount={overdueTasksCount}
        showOverdueOnly={showOverdueOnly}
        onOverdueFilterChange={setShowOverdueOnly}
        canCreateTasks={canCreateTasks}
        onCreateTask={handleAddTask}
        isUpdating={isUpdating}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
        >
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter((task) => task.status === column.status)
            return (
              <KanbanColumn
                key={column.id}
                status={column.status}
                tasks={columnTasks}
                onEdit={handleEditTask}
                onAddTask={handleAddTask}
                canAddTask={canCreateTasks}
              />
            )
          })}
        </div>
      </DragDropContext>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
      />
    </div>
  )
}

function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false
  const dueDate = new Date(task.dueDate)
  const today = new Date()
  today.setHours(23, 59, 59, 999) // End of today
  return dueDate < today && task.status !== "done"
}
