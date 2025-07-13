"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useSchedule } from "@/lib/schedule-context"
import { useUser } from "@/lib/user-context"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Plus, Edit, Trash2, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { UserScheduleFormData } from "@/lib/types"

export default function SchedulePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { schedules, createSchedule, updateSchedule, deleteSchedule, fetchSchedules } = useSchedule()
  const { users } = useUser()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)
  const [newSchedule, setNewSchedule] = useState<UserScheduleFormData>({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:00",
  })

  const daysOfWeek = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
  ]

  useEffect(() => {
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

      // Verificar se é administrador de laboratório ou se está visualizando seus próprios horários
    const isAdmin = user.role === "administrador_laboratorio"
  const userSchedules = isAdmin ? schedules : schedules.filter(s => s.userId === user.id)

  const openDialog = (schedule?: any) => {
    if (schedule) {
      setEditingSchedule(schedule)
      setNewSchedule({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })
    } else {
      setEditingSchedule(null)
      setNewSchedule({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "10:00",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, newSchedule)
        toast({
          title: "Horário atualizado!",
          description: "Seu horário foi atualizado com sucesso.",
        })
      } else {
        await createSchedule({
          ...newSchedule,
          userId: user.id,
        })
        toast({
          title: "Horário criado!",
          description: "Seu horário foi adicionado com sucesso.",
        })
      }
      setIsDialogOpen(false)
      setEditingSchedule(null)
      fetchSchedules()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar o horário.",
      })
    }
  }

  const handleDelete = async (scheduleId: number) => {
    try {
      await deleteSchedule(scheduleId)
      toast({
        title: "Horário excluído!",
        description: "Seu horário foi removido com sucesso.",
      })
      fetchSchedules()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o horário.",
      })
    }
  }

  const getDayName = (dayOfWeek: number) => {
    return daysOfWeek.find(day => day.value === dayOfWeek)?.label || "Desconhecido"
  }

  const getUserName = (userId: number) => {
    return users.find(u => u.id === userId)?.name || "Usuário desconhecido"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Horários</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Visualize e gerencie os horários de todos os membros" : "Gerencie seus horários no laboratório"}
            </p>
          </div>
          <Button onClick={() => openDialog()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Horário
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daysOfWeek.map((day) => {
            const daySchedules = userSchedules.filter(s => s.dayOfWeek === day.value)
            
            return (
              <Card key={day.value}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {day.label}
                  </CardTitle>
                  <CardDescription>
                    {daySchedules.length} horário(s) agendado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {daySchedules.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum horário agendado</p>
                  ) : (
                    <div className="space-y-2">
                      {daySchedules.map((schedule) => (
                        <div 
                          key={schedule.id} 
                          className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {isAdmin ? getUserName(schedule.userId) : "Você"}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDialog(schedule)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Dialog para adicionar/editar horário */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Editar Horário" : "Adicionar Novo Horário"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dayOfWeek">Dia da Semana</Label>
                <Select
                  value={newSchedule.dayOfWeek.toString()}
                  onValueChange={(value) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startTime">Horário de Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Horário de Fim</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingSchedule ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </main>
    </div>
  )
} 