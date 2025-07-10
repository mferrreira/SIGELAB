"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { useDailyLogs } from "@/lib/daily-log-context"
import { useAuth } from "@/lib/auth-context"
import { DailyLogForm } from "@/components/ui/daily-log-form"
import { DailyLogList } from "@/components/ui/daily-log-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, User, Trophy, Calendar } from "lucide-react"
import type { DailyLog, DailyLogFormData } from "@/lib/types"

export default function ProfilePage() {
  const { user } = useAuth()
  const { logs, loading, error, createLog, updateLog, deleteLog } = useDailyLogs()
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const today = new Date().toISOString().split("T")[0]
  const hasTodayLog = logs.some((log) => log.date.toString().slice(0, 10) === today)
  const todayLog = logs.find((log) => log.date.toString().slice(0, 10) === today)

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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{user.points} pontos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{user.completedTasks} tarefas concluídas</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Log Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Registros Diários</span>
                </CardTitle>
                {!showForm && !hasTodayLog && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
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
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <h3 className="font-medium text-blue-900 mb-4">
                          {editingLog ? "Editar Registro" : "Registro de Hoje"}
                        </h3>
                        <DailyLogForm
                          initialNote={editingLog?.note || ""}
                          onSubmit={handleSubmit}
                          onCancel={handleCancel}
                          isSubmitting={submitting}
                          error={formError}
                          userId={user.id}
                          date={today}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Logs List */}
                  <DailyLogList
                    logs={logs.slice(0, 10)}
                    currentUser={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isSubmitting={submitting}
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