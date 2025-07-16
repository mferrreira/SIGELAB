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
  AlertCircle,
  ChevronLeft,
  ChevronRight
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { UserWeeklyHoursTable } from "@/components/ui/user-weekly-hours-table";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminWeeklyHoursTable } from "@/components/admin/AdminWeeklyHoursTable";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ScheduleManagementDialog } from "@/components/admin/ScheduleManagementDialog";
import { AddEditScheduleDialog } from "@/components/admin/AddEditScheduleDialog";

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
  const [allSessionsLoaded, setAllSessionsLoaded] = useState(false)
  const [allSessions, setAllSessions] = useState<any[]>([])
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  
  // Load all sessions for admin dashboard
  const loadAllSessions = async () => {
    try {
      const response = await WorkSessionsAPI.getAll()
      // Store all sessions locally for admin dashboard
      const sessions = Array.isArray(response) ? response : (response?.data || [])
      setAllSessions(sessions)
      setAllSessionsLoaded(true)
    } catch (error) {
      console.error('DEBUG Admin: Error loading all sessions:', error)
    }
  }

  useEffect(() => {
    if (users.length > 0 && !allSessionsLoaded) {
      loadAllSessions()
    }
  }, [users, allSessionsLoaded])
  
  // Custom function to calculate weekly hours using all sessions
  const calculateWeeklyHours = (userId: number, weekStart: string, weekEnd: string): number => {
    
    const weekSessions = allSessions.filter(session => {
      if (!session || !session.startTime) return false;
      const sessionDate = new Date(session.startTime);
      return (
        session.userId === userId &&
        session.status === "completed" &&
        session.duration &&
        sessionDate >= new Date(weekStart) &&
        sessionDate <= new Date(weekEnd)
      );
    });
    
    const totalSeconds = weekSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const hours = totalSeconds / 3600; // Convert seconds to hours
    return hours;
  };
  
  useEffect(() => {
    async function fetchAllWeeklyHours() {
      const result: Record<number, number> = {}
      users.forEach((u) => {
        result[u.id] = calculateWeeklyHours(u.id, monday.toISOString(), sunday.toISOString())
      })
      setWeeklyHoursByUser(result)
    }
    if (users.length > 0 && allSessionsLoaded) {
      fetchAllWeeklyHours()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, allSessions, allSessionsLoaded])
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
      setActiveSessions(result)
    }
    fetchActive()
    interval = setInterval(fetchActive, 30000)
    return () => clearInterval(interval)
  }, [])

  const [allWeeks, setAllWeeks] = useState<any[]>([])
  const [selectedHistoryWeekIdx, setSelectedHistoryWeekIdx] = useState(0)
  const [loadingWeeks, setLoadingWeeks] = useState(false)
  const [historyByWeek, setHistoryByWeek] = useState<any[]>([])
  const [resettingHours, setResettingHours] = useState(false)
  
  // Atualizar tabela ao mudar semana
  useEffect(() => {
    if (allWeeks.length > 0) {
      setHistoryByWeek(allWeeks[selectedHistoryWeekIdx]?.users || [])
    }
  }, [selectedHistoryWeekIdx, allWeeks])

  // Função para reset manual das horas semanais
  const handleResetWeeklyHours = async () => {
    try {
      setResettingHours(true)
      const response = await fetch('/api/weekly-hours-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset' })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert(`Reset realizado com sucesso!\n\n${data.results.length} usuários processados.\nTotal de horas salvas: ${data.results.reduce((sum: number, r: any) => sum + parseFloat(r.savedHours), 0).toFixed(1)}h`)
        // setResetDialogOpen(false) // Removed because setResetDialogOpen is not defined
        // Recarregar dados
        window.location.reload()
      } else {
        alert(`Erro ao resetar horas: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao resetar horas:', error)
      alert('Erro ao resetar horas semanais')
    } finally {
      setResettingHours(false)
    }
  }

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
        <AdminStatsCards stats={stats} users={users} projects={projects} />

        {/* Weekly Work Hours Table */}
        <AdminWeeklyHoursTable users={users} />

        <AdminTabs
          users={users}
          projects={projects}
          tasks={tasks}
          responsibilities={responsibilities}
          dailyLogs={dailyLogs}
          sessions={sessions}
          stats={stats}
          projectsWithProgress={projectsWithProgress}
          usersByProject={usersByProject}
          recentResponsibilities={recentResponsibilities}
          recentDailyLogs={recentDailyLogs}
          weekSchedule={weekSchedule}
          activeSessions={activeSessions}
          // Add any other necessary props
        />
      </main>
      
      {/* Dialog para Adicionar/Editar Horário */}
      <AddEditScheduleDialog
        open={addEditScheduleDialogOpen}
        onOpenChange={setAddEditScheduleDialogOpen}
        editingSchedule={editingSchedule}
        selectedUser={selectedUser}
        scheduleForm={scheduleForm}
        setScheduleForm={setScheduleForm}
        scheduleError={scheduleError}
        handleCreateSchedule={handleCreateSchedule}
        handleUpdateSchedule={handleUpdateSchedule}
        setAddEditScheduleDialogOpen={setAddEditScheduleDialogOpen}
        // Add any other necessary props
      />
    </div>
  )
} 