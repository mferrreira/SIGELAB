"use client"

import { StatsCard } from "@/components/ui/stats-card"
import { 
  Users, 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Activity,
  UserCheck,
  CalendarDays,
  BarChart3
} from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalUsers?: number
    totalProjects?: number
    totalTasks?: number
    completedTasks?: number
    activeResponsibilities?: number
    totalPoints?: number
    avgCompletionRate?: number
    pendingUsers?: number
    overdueTasks?: number
  }
  className?: string
}

export function DashboardStats({ stats, className = "" }: DashboardStatsProps) {
  const {
    totalUsers = 0,
    totalProjects = 0,
    totalTasks = 0,
    completedTasks = 0,
    activeResponsibilities = 0,
    totalPoints = 0,
    avgCompletionRate = 0,
    pendingUsers = 0,
    overdueTasks = 0
  } = stats

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <StatsCard
        title="Total de Usuários"
        value={totalUsers}
        description="Usuários registrados"
        icon={Users}
        variant="default"
        progress={pendingUsers > 0 ? {
          value: totalUsers - pendingUsers,
          max: totalUsers,
          label: "Usuários ativos"
        } : undefined}
      />

      <StatsCard
        title="Projetos Ativos"
        value={totalProjects}
        description="Projetos em andamento"
        icon={FolderOpen}
        variant="default"
      />

      <StatsCard
        title="Tarefas Concluídas"
        value={completedTasks}
        description={`de ${totalTasks} tarefas`}
        icon={CheckCircle}
        variant="success"
        progress={{
          value: completedTasks,
          max: totalTasks,
          label: "Taxa de conclusão"
        }}
        trend={{
          value: Math.round(completionRate),
          isPositive: completionRate >= 70,
          label: "vs meta"
        }}
      />

      <StatsCard
        title="Pontos Totais"
        value={totalPoints}
        description="Pontos distribuídos"
        icon={TrendingUp}
        variant="warning"
      />

      <StatsCard
        title="Responsabilidades Ativas"
        value={activeResponsibilities}
        description="Em andamento"
        icon={Activity}
        variant="default"
      />

      <StatsCard
        title="Usuários Pendentes"
        value={pendingUsers}
        description="Aguardando aprovação"
        icon={UserCheck}
        variant={pendingUsers > 0 ? "warning" : "success"}
      />

      <StatsCard
        title="Tarefas Atrasadas"
        value={overdueTasks}
        description="Fora do prazo"
        icon={Clock}
        variant={overdueTasks > 0 ? "danger" : "success"}
      />

      <StatsCard
        title="Taxa de Conclusão"
        value={`${Math.round(avgCompletionRate)}%`}
        description="Média geral"
        icon={BarChart3}
        variant={avgCompletionRate >= 70 ? "success" : avgCompletionRate >= 50 ? "warning" : "danger"}
        trend={{
          value: Math.round(avgCompletionRate),
          isPositive: avgCompletionRate >= 70,
          label: "meta 70%"
        }}
      />
    </div>
  )
} 