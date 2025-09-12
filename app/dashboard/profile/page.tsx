"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { useDailyLogs } from "@/contexts/daily-log-context"
import { useAuth } from "@/contexts/auth-context"
import { DailyLogForm } from "@/components/forms/daily-log-form"
import { DailyLogList } from "@/components/ui/daily-log-list"
import { UserApproval } from "@/components/features/user-approval"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarDays } from "lucide-react"
import type { DailyLog, DailyLogFormData } from "@/contexts/types"
import { TimerCard } from "@/components/ui/timer-card"
import { useWorkSessions } from "@/contexts/work-session-context"

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const { logs, loading, error, createLog, updateLog, deleteLog } = useDailyLogs()
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const { sessions, getWeeklyHours, endSession } = useWorkSessions()
  const [user, setUser] = useState(authUser)
  const [weeklyHours, setWeeklyHours] = useState<number>(0)

  const today = new Date()
  const isoToday = today.toISOString().split("T")[0]

  // Calculate week start (Monday) and end (Sunday)
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  // Check if user has a completed session for today
  const hasCompletedSessionToday =
    Array.isArray(sessions) &&
    sessions.filter(Boolean).some(
      (s) =>
        typeof s?.status === "string" &&
        s.status === "completed" &&
        s.startTime &&
        new Date(s.startTime).toISOString().split("T")[0] === isoToday
    )
  useEffect(() => {
    if (authUser) {
      // UsersAPI.getById(authUser.id).then(({ user }) => setUser(user)) // Removed UsersAPI import
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser])

  useEffect(() => {
    if (user) {
      getWeeklyHours(user.id, monday.toISOString(), sunday.toISOString()).then(setWeeklyHours)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessions])

  const handleSubmit = async (formData: DailyLogFormData) => {
    if (!user) return
    
    setSubmitting(true)
    setFormError(null)
    
    try {
      if (editingLog) {
        await updateLog(editingLog.id, { note: formData.note })
        setEditingLog(null)
      } else {
        await createLog(formData)
        setShowForm(false)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao salvar registro")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (log: DailyLog) => {
    setEditingLog(log)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    setSubmitting(true)
    try {
      await deleteLog(id)
    } catch (err) {
      console.error("Erro ao excluir registro:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingLog(null)
    setFormError(null)
  }

  // Sort logs by latest add (createdAt descending)
  const userLogs = logs
    .filter((log) => log.userId === user?.id)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return dateB - dateA;
    });

  // Substituir weeklyHours por user.currentWeekHours
  const progressoSemanal = user?.currentWeekHours ?? 0;
  const metaSemanal = user?.weekHours ?? 0;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {/* Removed Plus icon */}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      {/* Removed Trophy icon */}
                      <span className="text-sm font-medium">{user.points} pontos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Removed Calendar icon */}
                      <span className="text-sm font-medium">{user.completedTasks} tarefas concluídas</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Hours Summary Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{progressoSemanal.toFixed(1)} h</div>
                <div className="text-sm text-muted-foreground">Horas trabalhadas nesta semana</div>
                <div className="text-sm mt-1">
                  {metaSemanal !== undefined && (() => {
                    const remaining = metaSemanal - progressoSemanal;
                    if (remaining > 0) return `${remaining.toFixed(1)}h restantes`;
                    if (remaining < 0) return `+${Math.abs(remaining).toFixed(1)}h extra`;
                    return 'Meta semanal atingida!';
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timer Card */}
          <TimerCard onSessionEnd={(updatedUser) => {
            if (updatedUser) setUser(updatedUser)
            else if (authUser) {
              // UsersAPI.getById(authUser.id).then(({ user }) => setUser(user)) // Removed UsersAPI import
            }
          }} />

          {/* User Approval Section - Only for admins and laboratorists */}
          {(user.roles?.includes("COORDENADOR") || user.roles?.includes("LABORATORISTA")) && (
            <UserApproval />
          )}

          {/* Daily Log Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Registros Diários</span>
                </CardTitle>
                {!showForm && (
                  <Button onClick={() => setShowForm(true)} disabled={!hasCompletedSessionToday}>
                    {/* Removed Plus icon */}
                    Adicionar Registro
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Carregando...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Today's Log Form */}
                  {showForm && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <h3 className="font-medium text-blue-900 mb-4">
                          {editingLog ? "Editar Registro" : "Novo Registro"}
                        </h3>
                        {hasCompletedSessionToday ? (
                          <DailyLogForm
                            initialNote={editingLog?.note || ""}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isSubmitting={submitting}
                            error={formError}
                            userId={user.id}
                            date={new Date().toISOString()}
                          />
                        ) : (
                          <div className="text-blue-700 text-sm mt-2">
                            Para registrar um log, inicie e finalize uma sessão de trabalho usando o timer acima.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Logs List */}
                  <DailyLogList
                    logs={userLogs}
                    currentUser={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isSubmitting={submitting}
                    showAuthor={user.roles?.includes('COORDENADOR')}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 