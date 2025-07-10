"use client"

import { Droppable } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { KanbanCard } from "@/components/ui/kanban-card"
import type { KanbanColumnProps, Task } from "@/lib/types"

export function KanbanColumn({ id, title, tasks, onEdit }: KanbanColumnProps) {
  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case "todo":
        return "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50"
      case "in-progress":
        return "border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
      case "in-review":
        return "border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20"
      case "adjust":
        return "border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20"
      case "done":
        return "border-green-300 bg-green-50 dark:border-emerald-600 dark:bg-emerald-900/20"
      default:
        return "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50"
    }
  }

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case "todo":
        return "📋"
      case "in-progress":
        return "⚡"
      case "in-review":
        return "👀"
      case "adjust":
        return "🔧"
      case "done":
        return "✅"
      default:
        return "📋"
    }
  }

  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`h-fit min-h-[400px] sm:min-h-[500px] ${getColumnColor(id)} ${
            snapshot.isDraggingOver ? "ring-2 ring-blue-400" : ""
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <span className="flex items-center">
                <span className="mr-2">{getColumnIcon(id)}</span>
                {title}
              </span>
              <Badge variant="secondary" className="text-xs">
                {tasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  isOverdue={isTaskOverdue(task)}
                  index={index}
                />
              ))}
              {provided.placeholder}
            </div>
          </CardContent>
        </Card>
      )}
    </Droppable>
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