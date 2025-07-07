"use client"

import { Droppable, Draggable } from "@hello-pangea/dnd"
import { KanbanCard } from "@/components/kanban-card"
import type { Task } from "@/lib/types"

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  onEdit: (task: Task) => void
}

export function KanbanColumn({ id, title, tasks, onEdit }: KanbanColumnProps) {
  // Mapear status para cor de fundo
  const getBgColor = () => {
    switch (id) {
      case "todo":
        return "bg-muted/50"
      case "in-progress":
        return "bg-blue-50 dark:bg-blue-950/30"
      case "in-review":
        return "bg-purple-50 dark:bg-purple-950/30"
      case "adjust":
        return "bg-amber-50 dark:bg-amber-950/30"
      case "done":
        return "bg-green-50 dark:bg-green-950/30"
      default:
        return "bg-muted/50"
    }
  }

  return (
    <div className={`rounded-lg p-3 ${getBgColor()}`}>
      <h3 className="font-medium text-sm mb-3">
        {title} ({tasks.length})
      </h3>

      <Droppable droppableId={id}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[200px]">
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-3"
                  >
                    <KanbanCard task={task} onEdit={() => onEdit(task)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
