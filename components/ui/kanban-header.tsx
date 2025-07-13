"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, AlertTriangle, Filter } from "lucide-react"

interface KanbanHeaderProps {
  title?: string
  overdueCount?: number
  showOverdueOnly: boolean
  onOverdueFilterChange: (show: boolean) => void
  canCreateTasks?: boolean
  onCreateTask?: () => void
  isUpdating?: boolean
}

export function KanbanHeader({
  title = "Quadro Kanban",
  overdueCount = 0,
  showOverdueOnly,
  onOverdueFilterChange,
  canCreateTasks = false,
  onCreateTask,
  isUpdating = false
}: KanbanHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {overdueCount > 0 && (
          <div className="flex items-center text-orange-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-sm hidden sm:inline">
              {overdueCount} tarefa(s) atrasada(s)
            </span>
            <span className="text-sm sm:hidden">{overdueCount}</span>
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
              onCheckedChange={onOverdueFilterChange}
            >
              Mostrar apenas atrasadas
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {canCreateTasks && onCreateTask && (
          <Button onClick={onCreateTask} disabled={isUpdating}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nova Tarefa</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        )}
      </div>
    </div>
  )
} 