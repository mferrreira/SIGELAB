"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useUser } from "@/contexts/user-context"
import { useProject } from "@/contexts/project-context"
import { useTask } from "@/contexts/task-context"
import { useResponsibility } from "@/contexts/responsibility-context"
import { useDailyLogs } from "@/contexts/daily-log-context"
import { useSchedule } from "@/contexts/schedule-context"
import { useWorkSessions } from "@/contexts/work-session-context"
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
  BarChart3,
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react"
import type { Project, Task, LabResponsibility, DailyLog, UserSchedule, User } from "@/contexts/types"
import { UsersAPI } from "@/contexts/api-client"
import { UserApproval } from "@/components/user-approval"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WorkSessionsAPI } from "@/contexts/api-client"

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { users } = useUser()
  const { projects } = useProject()
  const { tasks } = useTask()
  const { responsibilities } = useResponsibility()
  const { logs: dailyLogs } = useDailyLogs()
  const { schedules, createSchedule, updateSchedule, deleteSchedule, fetchSchedules } = useSchedule()
  const { sessions, getWeeklyHours } = useWorkSessions()
  const [weeklyHoursByUser, setWeeklyHoursByUser] = useState<Record<number, number>>({})
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  useEffect(() => {
    async function fetchAllWeeklyHours() {
      const result: Record<number, number> = {}
      await Promise.all(
        users.map(async (u) => {
          result[u.id] = await getWeeklyHours(u.id, monday.toISOString(), sunday.toISOString())
        })
      )
      setWeeklyHoursByUser(result)
    }
    if (users.length > 0) {
      fetchAllWeeklyHours()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, sessions])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [scheduleManagementDialogOpen, setScheduleManagementDialogOpen] = useState(false)
  const [addEditScheduleDialogOpen, setAddEditScheduleDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:00"
  })
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])
  // Verificar se é administrador de laboratório
  const isAdmin = user?.role === "administrador_laboratorio"
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
  const recentResponsibilities = useMemo(() => {
    return responsibilities
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 10)
  }, [responsibilities])
  const recentDailyLogs = useMemo(() => {
    return dailyLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [dailyLogs])
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
  const selectedUserSchedules = useMemo(() => {
    if (!selectedUserId) return []
    return schedules.filter(s => s.userId === parseInt(selectedUserId))
  }, [schedules, selectedUserId])
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null
    return users.find(u => u.id === parseInt(selectedUserId))
  }, [users, selectedUserId])
  const scheduleStats = useMemo(() => {
    if (!selectedUser) return null
    const totalMinutes = selectedUserSchedules.reduce((total, schedule) => {
      const [startH, startM] = schedule.startTime.split(':').map(Number)
      const [endH, endM] = schedule.endTime.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM
      return total + (endMinutes - startMinutes)
    }, 0)
    const scheduledHours = totalMinutes / 60
    const allowedHours = selectedUser.weekHours
    const remainingHours = allowedHours - scheduledHours
    return {
      scheduledHours: Math.round(scheduledHours * 100) / 100,
      allowedHours,
      remainingHours: Math.round(remainingHours * 100) / 100,
      isOverLimit: scheduledHours > allowedHours
    }
  }, [selectedUserSchedules, selectedUser])

  // Funções para gerenciar horários
  const handleCreateSchedule = async () => {
    if (!selectedUserId) return
    
    try {
      setScheduleError(null)
      await createSchedule({
        userId: parseInt(selectedUserId),
        ...scheduleForm
      })
      setAddEditScheduleDialogOpen(false)
      setScheduleForm({ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" })
      await fetchSchedules(parseInt(selectedUserId))
    } catch (err: any) {
      setScheduleError(err.message || "Erro ao criar horário")
    }
  }

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return
    
    try {
      setScheduleError(null)
      await updateSchedule(editingSchedule.id, scheduleForm)
      setAddEditScheduleDialogOpen(false)
      setEditingSchedule(null)
      setScheduleForm({ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" })
      await fetchSchedules(parseInt(selectedUserId))
    } catch (err: any) {
      setScheduleError(err.message || "Erro ao atualizar horário")
    }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("Tem certeza que deseja excluir este horário?")) return
    
    try {
      await deleteSchedule(scheduleId)
      await fetchSchedules(parseInt(selectedUserId))
    } catch (err) {
      console.error("Erro ao excluir horário:", err)
    }
  }

  const openEditDialog = (schedule: any) => {
    setEditingSchedule(schedule)
    setScheduleForm({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    })
    setAddEditScheduleDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingSchedule(null)
    setScheduleForm({ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" })
    setScheduleError(null)
    setAddEditScheduleDialogOpen(true)
  }

  // Carregar horários quando usuário for selecionado
  useEffect(() => {
    if (selectedUserId) {
      fetchSchedules(parseInt(selectedUserId))
    }
  }, [selectedUserId, fetchSchedules])

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

  // Active sessions for admin
  const [activeSessions, setActiveSessions] = useState<any[]>([])
  useEffect(() => {
    let interval: NodeJS.Timeout
    async function fetchActive() {
      const result = await WorkSessionsAPI.getActiveSessions()
      console.log('Fetched activeSessions (raw):', result)
      setActiveSessions(result)
    }
    fetchActive()
    interval = setInterval(fetchActive, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

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

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Badge variant="outline" className="text-sm">
            <UserCheck className="h-4 w-4 mr-1" />
            Administrador de Laboratório
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

        {/* Weekly Work Hours Table */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              <span>Horas Trabalhadas por Usuário (Semana Atual)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Horas Trabalhadas</TableHead>
                  <TableHead className="text-right">Horas Esperadas</TableHead>
                  <TableHead className="text-right">Diferença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const actual = weeklyHoursByUser[u.id] || 0
                  const expected = u.weekHours || 0
                  const diff = actual - expected
                  let diffColor = "text-gray-700"
                  let diffText = ''
                  if (diff < 0) {
                    diffColor = "text-red-600 font-bold"
                    diffText = `${Math.abs(diff).toFixed(1)}h restantes`
                  } else if (diff > 0) {
                    diffColor = "text-green-600 font-bold"
                    diffText = `+${diff.toFixed(1)}h extra`
                  } else {
                    diffColor = "text-blue-600 font-bold"
                    diffText = 'Meta semanal atingida!'
                  }
                  return (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="text-right font-bold text-blue-900">
                        {actual.toFixed(1)} h
                      </TableCell>
                      <TableCell className="text-right text-blue-700">
                        {expected.toFixed(1)} h
                      </TableCell>
                      <TableCell className={`text-right ${diffColor}`}>
                        {diffText}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
                          <TabsList>
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="projects">Projetos</TabsTrigger>
                  <TabsTrigger value="responsibilities">Responsabilidades</TabsTrigger>
                  <TabsTrigger value="schedule">Horários</TabsTrigger>
                  <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
                  <TabsTrigger value="users">Usuários</TabsTrigger>
                </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card: Usuários em Sessão */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Usuários em Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(Array.isArray(activeSessions) ? activeSessions : []).length === 0 ? (
                    <div className="text-muted-foreground text-sm">Nenhum usuário em sessão no momento.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Início</TableHead>
                          <TableHead>Duração</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(Array.isArray(activeSessions) ? activeSessions : []).map(session => {
                          const start = new Date(session.startTime)
                          const now = new Date()
                          const diffMs = now.getTime() - start.getTime()
                          const diffH = Math.floor(diffMs / (1000 * 60 * 60))
                          const diffM = Math.floor((diffMs / (1000 * 60)) % 60)
                          return (
                            <TableRow key={session.id}>
                              <TableCell>{session.user?.name || session.userName}</TableCell>
                              <TableCell>{start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                              <TableCell>{diffH > 0 ? `${diffH}h ` : ''}{diffM}min</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
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
                      <div className="space-y-3">
                        {recentDailyLogs.slice(0, 3).map((log) => (
                          <div key={log.id} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">
                                {users.find(u => u.id === log.userId)?.name}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {new Date(log.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {log.note && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                {log.note}
                              </p>
                            )}
                          </div>
                        ))}
                        {recentDailyLogs.length === 0 && (
                          <div className="text-center text-muted-foreground text-sm py-4">
                            Nenhum log de atividade recente
                          </div>
                        )}
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Horários da Semana
                    </CardTitle>
                    <CardDescription>Agenda semanal dos membros do laboratório</CardDescription>
                  </div>
                  <Dialog open={scheduleManagementDialogOpen} onOpenChange={setScheduleManagementDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setScheduleManagementDialogOpen(true)} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Gerenciar Horários
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Gerenciar Horários dos Usuários
                        </DialogTitle>
                        <DialogDescription>Adicionar, editar e remover horários semanais dos membros</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Seletor de Usuário */}
                        <div className="space-y-2">
                          <Label htmlFor="user-select">Selecionar Usuário</Label>
                          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha um usuário" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.filter(u => u.status === "active").map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.name} ({user.role}) - {user.weekHours}h/sem
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Estatísticas do Usuário Selecionado */}
                        {selectedUser && scheduleStats && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-blue-50 dark:bg-blue-950/30">
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {scheduleStats.scheduledHours}h
                                </div>
                                <p className="text-xs text-muted-foreground">Agendadas</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-green-50 dark:bg-green-950/30">
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  {scheduleStats.allowedHours}h
                                </div>
                                <p className="text-xs text-muted-foreground">Permitidas</p>
                              </CardContent>
                            </Card>
                            <Card className={scheduleStats.isOverLimit ? "bg-red-50 dark:bg-red-950/30" : "bg-gray-50 dark:bg-gray-950/30"}>
                              <CardContent className="pt-4">
                                <div className={`text-2xl font-bold ${scheduleStats.isOverLimit ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                                  {scheduleStats.remainingHours}h
                                </div>
                                <p className="text-xs text-muted-foreground">Restantes</p>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Alerta se exceder limite */}
                        {selectedUser && scheduleStats && scheduleStats.isOverLimit && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              O usuário {selectedUser.name} excede o limite semanal em {Math.abs(scheduleStats.remainingHours)}h.
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Horários da Semana */}
                        {selectedUser && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold">Horários de {selectedUser.name}</h3>
                              <Button onClick={openCreateDialog} size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Adicionar Horário
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                              {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, dayIndex) => {
                                const daySchedules = selectedUserSchedules.filter(s => s.dayOfWeek === dayIndex)
                                
                                return (
                                  <div key={day} className="space-y-2">
                                    <h4 className="font-medium text-center text-sm">{day}</h4>
                                    <div className="space-y-1">
                                      {daySchedules.map((schedule) => (
                                        <div 
                                          key={schedule.id} 
                                          className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs relative group"
                                        >
                                          <div className="font-medium">{schedule.startTime} - {schedule.endTime}</div>
                                          <div className="text-muted-foreground">
                                            {((parseInt(schedule.endTime.split(':')[0]) * 60 + parseInt(schedule.endTime.split(':')[1])) - 
                                              (parseInt(schedule.startTime.split(':')[0]) * 60 + parseInt(schedule.startTime.split(':')[1]))) / 60}h
                                          </div>
                                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex gap-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={() => openEditDialog(schedule)}
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                onClick={() => handleDeleteSchedule(schedule.id)}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      {daySchedules.length === 0 && (
                                        <div className="text-center text-muted-foreground text-xs py-2 border border-dashed rounded">
                                          Vazio
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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

          <TabsContent value="logs" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Logs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Logs de Atividade
                  </CardTitle>
                  <CardDescription>Registros detalhados das atividades dos membros</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Atividade</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyLogs
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((log) => {
                          const user = users.find(u => u.id === log.userId)
                          return (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">
                                {user?.name || 'Usuário não encontrado'}
                              </TableCell>
                              <TableCell>
                                {new Date(log.date).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  {log.note ? (
                                    <p className="text-sm line-clamp-2">{log.note}</p>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Sem descrição</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">Registrado</Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      {dailyLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="text-muted-foreground">
                              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Nenhum log de atividade encontrado</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Work Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Sessões de Trabalho
                  </CardTitle>
                  <CardDescription>Histórico de sessões de timer dos membros</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Atividade</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions
                        .filter(Boolean)
                        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                        .slice(0, 10)
                        .map((session) => {
                          const user = users.find(u => u.id === session.userId)
                          const startTime = new Date(session.startTime)
                          const endTime = session.endTime ? new Date(session.endTime) : null
                          const duration = endTime 
                            ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
                            : null
                          
                          return (
                            <TableRow key={session.id}>
                              <TableCell className="font-medium">
                                {user?.name || 'Usuário não encontrado'}
                              </TableCell>
                              <TableCell>
                                {duration ? `${duration} min` : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  {session.activity ? (
                                    <p className="text-sm line-clamp-2">{session.activity}</p>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Trabalho geral</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {session.location ? (
                                  <Badge variant="outline">{session.location}</Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Não especificado</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={session.status === "completed" ? "default" : 
                                         session.status === "active" ? "secondary" : "outline"}
                                >
                                  {session.status === "completed" ? "Concluída" :
                                   session.status === "active" ? "Ativa" : "Pausada"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      {sessions.filter(Boolean).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="text-muted-foreground">
                              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Nenhuma sessão de trabalho encontrada</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {/* User Approval Component - Always render to maintain hook order */}
            <UserApproval />
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
                      <TableHead>Horas Semanais</TableHead>
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
                            <span className="font-medium">{user.weekHours}</span>
                            <span className="text-muted-foreground text-xs ml-1">h/sem</span>
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
      
      {/* Dialog para Adicionar/Editar Horário */}
      <Dialog open={addEditScheduleDialogOpen} onOpenChange={setAddEditScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Editar Horário" : "Adicionar Horário"}
            </DialogTitle>
            <DialogDescription>
              Configure o horário para {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Dia da Semana</Label>
              <Select 
                value={scheduleForm.dayOfWeek.toString()} 
                onValueChange={(value) => setScheduleForm(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Domingo</SelectItem>
                  <SelectItem value="1">Segunda-feira</SelectItem>
                  <SelectItem value="2">Terça-feira</SelectItem>
                  <SelectItem value="3">Quarta-feira</SelectItem>
                  <SelectItem value="4">Quinta-feira</SelectItem>
                  <SelectItem value="5">Sexta-feira</SelectItem>
                  <SelectItem value="6">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Horário de Início</Label>
                <Input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Horário de Fim</Label>
                <Input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            {scheduleError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scheduleError}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddEditScheduleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}>
                {editingSchedule ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 