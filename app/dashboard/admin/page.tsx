"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useUser } from "@/lib/user-context"
import { useProject } from "@/lib/project-context"
import { useTask } from "@/lib/task-context"
import { useResponsibility } from "@/lib/responsibility-context"
import { useDailyLogs } from "@/lib/daily-log-context"
import { useSchedule } from "@/lib/schedule-context"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
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
import type { User, Project, Task, LabResponsibility, DailyLog, UserSchedule } from "@/lib/types"

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { users } = useUser()
  const { projects } = useProject()
  const { tasks } = useTask()
  const { responsibilities } = useResponsibility()
  const { logs: dailyLogs } = useDailyLogs()
  const { schedules } = useSchedule()

  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  // Verificar se é admin
  const isAdmin = user.role === "admin"
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 container mx-auto p-4 md:p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar o painel administrativo.</p>
          </div>
        </main>
      </div>
    )
  }

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalUsers = users.length
    const totalProjects = projects.length
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const activeResponsibilities = responsibilities.filter(r => !r.endTime).length
    const totalPoints = users.reduce((sum, u) => sum + u.points, 0)
    const avgCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    return {
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      activeResponsibilities,
      totalPoints,
      avgCompletionRate
    }
  }, [users, projects, tasks, responsibilities])

  // Projetos com progresso
  const projectsWithProgress = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id)
      const completedTasks = projectTasks.filter(t => t.completed).length
      const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0
      
      return {
        ...project,
        totalTasks: projectTasks.length,
        completedTasks,
        progress
      }
    })
  }, [projects, tasks])

  // Responsabilidades recentes
  const recentResponsibilities = useMemo(() => {
    return responsibilities
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10)
  }, [responsibilities])

  // Logs diários recentes
  const recentDailyLogs = useMemo(() => {
    return dailyLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [dailyLogs])

  // Horários da semana
  const weekSchedule = useMemo(() => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
    
    return days.map((day, dayIndex) => {
      const daySchedules = schedules.filter(s => s.dayOfWeek === dayIndex)
      return {
        day,
        dayIndex,
        schedules: daySchedules,
        timeSlots
      }
    })
  }, [schedules])

  // Usuários por projeto
  const usersByProject = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id)
      const userIds = [...new Set(projectTasks.map(t => t.assignedTo).filter(Boolean))]
      const projectUsers = users.filter(u => userIds.includes(u.id))
      
      return {
        project,
        users: projectUsers,
        totalTasks: projectTasks.length,
        completedTasks: projectTasks.filter(t => t.completed).length
      }
    })
  }, [projects, tasks, users])

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Badge variant="outline" className="text-sm">
            <UserCheck className="h-4 w-4 mr-1" />
            Administrador
          </Badge>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {users.filter(u => u.status === "active").length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {projects.filter(p => p.status === "active").length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.avgCompletionRate.toFixed(1)}% de conclusão
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">
                Média: {stats.totalUsers > 0 ? Math.round(stats.totalPoints / stats.totalUsers) : 0} por usuário
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="responsibilities">Responsabilidades</TabsTrigger>
            <TabsTrigger value="schedule">Horários</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Projetos com Progresso */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Progresso dos Projetos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectsWithProgress.map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {project.completedTasks}/{project.totalTasks}
                        </span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{project.status}</span>
                        <span>{project.progress.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Atividades Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Atividades Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Responsabilidades Ativas</h4>
                      <div className="space-y-2">
                        {responsibilities
                          .filter(r => !r.endTime)
                          .slice(0, 3)
                          .map((resp) => (
                            <div key={resp.id} className="flex justify-between items-center text-sm">
                              <span>{resp.userName}</span>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(resp.startTime).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Logs Recentes</h4>
                      <div className="space-y-2">
                        {recentDailyLogs.slice(0, 3).map((log) => (
                          <div key={log.id} className="flex justify-between items-center text-sm">
                            <span>{users.find(u => u.id === log.userId)?.name}</span>
                            <span className="text-muted-foreground">
                              {new Date(log.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes dos Projetos</CardTitle>
                <CardDescription>Progresso e participantes de cada projeto</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Participantes</TableHead>
                      <TableHead>Tarefas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersByProject.map(({ project, users, totalTasks, completedTasks }) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>
                          <Badge variant={project.status === "active" ? "default" : "secondary"}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} 
                              className="w-20 h-2" 
                            />
                            <span className="text-sm">
                              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {users.map(user => (
                              <Badge key={user.id} variant="outline" className="text-xs">
                                {user.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {completedTasks}/{totalTasks}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responsibilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Responsabilidades</CardTitle>
                <CardDescription>Histórico de responsabilidades do laboratório</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Fim</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentResponsibilities.map((resp) => {
                      const startTime = new Date(resp.startTime)
                      const endTime = resp.endTime ? new Date(resp.endTime) : null
                      const duration = endTime 
                        ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
                        : null

                      return (
                        <TableRow key={resp.id}>
                          <TableCell className="font-medium">{resp.userName}</TableCell>
                          <TableCell>
                            {startTime.toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {endTime ? endTime.toLocaleString('pt-BR') : '-'}
                          </TableCell>
                          <TableCell>
                            {duration ? `${duration} min` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={resp.endTime ? "default" : "secondary"}>
                              {resp.endTime ? "Concluída" : "Ativa"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Horários da Semana
                </CardTitle>
                <CardDescription>Agenda semanal dos membros do laboratório</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  {weekSchedule.map(({ day, schedules }) => (
                    <div key={day} className="space-y-2">
                      <h3 className="font-medium text-center">{day}</h3>
                      <div className="space-y-1">
                        {schedules.map((schedule) => (
                          <div 
                            key={schedule.id} 
                            className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs"
                          >
                            <div className="font-medium">{schedule.user?.name}</div>
                            <div className="text-muted-foreground">
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                        ))}
                        {schedules.length === 0 && (
                          <div className="text-center text-muted-foreground text-xs py-2">
                            Nenhum horário
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usuários e Progresso</CardTitle>
                <CardDescription>Estatísticas individuais dos membros</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Tarefas Concluídas</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const userTasks = tasks.filter(t => t.assignedTo === user.id)
                      const completedTasks = userTasks.filter(t => t.completed).length
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{user.points}</span>
                              <span className="text-muted-foreground text-xs">pts</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span>{completedTasks}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === "active" ? "default" : "secondary"}>
                              {user.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 