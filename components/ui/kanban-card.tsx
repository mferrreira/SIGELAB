"use client"

import { useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, AlertTriangle, Calendar, User, Flag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Task, KanbanCardProps } from "@/lib/types"

interface DraggableKanbanCardProps extends KanbanCardProps {
  index: number
}

export function KanbanCard({ task, onEdit, isOverdue, index }: DraggableKanbanCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
      case "in-review":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
      case "adjust":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${snapshot.isDragging ? "rotate-2 shadow-lg" : ""}`}
        >
          <TooltipProvider>
            <Card
              className={`mb-3 cursor-grab transition-all duration-200 hover:shadow-md ${
                isOverdue ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-600"
              } ${snapshot.isDragging ? "shadow-xl" : ""}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2 flex-1 mr-2">
                    {task.title}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 opacity-0 transition-opacity ${
                          isHovered ? "opacity-100" : ""
                        }`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {task.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                    <Flag className="mr-1 h-3 w-3" />
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                    {task.status}
                  </Badge>
                  {task.points > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {task.points} pts
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    {task.dueDate && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(task.dueDate)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Data de vencimento</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {isOverdue && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Atrasada
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tarefa atrasada</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </CardContent>
            </Card>
          </TooltipProvider>
        </div>
      )}
    </Draggable>
  )
} 