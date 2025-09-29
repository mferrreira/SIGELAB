"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle,
  Calendar,
  Users
} from "lucide-react"
import { useToast } from "@/contexts/use-toast"

const TIME_SLOTS = [
  { start: "07:00", end: "09:00" },
  { start: "09:00", end: "11:00" },
  { start: "11:00", end: "13:00" },
  { start: "13:00", end: "15:00" },
  { start: "15:00", end: "17:00" },
  { start: "17:00", end: "19:00" },
  { start: "19:00", end: "21:00" },
]

const WEEK_DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]

// Generate a subtle color for each user based on their id
function getUserColor(userId: number) {
  const colors = [
    "bg-blue-100 text-blue-900 border-blue-200",
    "bg-green-100 text-green-900 border-green-200",
    "bg-yellow-100 text-yellow-900 border-yellow-200",
    "bg-purple-100 text-purple-900 border-purple-200",
    "bg-pink-100 text-pink-900 border-pink-200",
    "bg-cyan-100 text-cyan-900 border-cyan-200",
    "bg-orange-100 text-orange-900 border-orange-200",
    "bg-indigo-100 text-indigo-900 border-indigo-200",
    "bg-teal-100 text-teal-900 border-teal-200",
    "bg-rose-100 text-rose-900 border-rose-200",
  ]
  return colors[userId % colors.length]
}

interface ScheduleGridProps {
  users: any[]
}

export function ScheduleGrid({ users }: ScheduleGridProps) {
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [userSchedule, setUserSchedule] = useState<{ dayOfWeek: number, startTime: string, endTime: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSchedules()
  }, [])

  useEffect(() => {
    setUserSchedule([])
  }, [selectedUserId])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/schedules")
      const data = await response.json()
      setSchedules(data.schedules || [])
    } catch (error) {
      console.error("Erro ao buscar horários:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scheduleId: number) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir")
      }

      setSchedules(prev => prev.filter(s => s.id !== scheduleId))
      toast({
        title: "Sucesso",
        description: "Horário removido com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao excluir horário:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o horário.",
        variant: "destructive"
      })
    }
  }

  const handleDayChange = (dayIdx: number, checked: boolean) => {
    if (checked) {
      setUserSchedule(prev => [...prev, { dayOfWeek: dayIdx, startTime: "09:00", endTime: "10:00" }])
    } else {
      setUserSchedule(prev => prev.filter(s => s.dayOfWeek !== dayIdx))
    }
  }

  const handleTimeChange = (dayIdx: number, field: "startTime" | "endTime", value: string) => {
    setUserSchedule(prev => prev.map(s => s.dayOfWeek === dayIdx ? { ...s, [field]: value } : s))
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    
    if (!selectedUserId || isNaN(parseInt(selectedUserId))) {
      toast({
        title: "Erro",
        description: "Selecione um usuário válido.",
        variant: "destructive"
      })
      setSaving(false)
      return
    }

    try {
      // 1. Delete all existing schedules for this user
      const userSchedules = schedules.filter(s => s.userId === parseInt(selectedUserId))
      await Promise.all(userSchedules.map(async (s) => {
        await fetch(`/api/schedules/${s.id}`, { method: "DELETE" })
      }))

      // 2. Create new schedules
      for (const s of userSchedule) {
        const payload = {
          userId: parseInt(selectedUserId),
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        }
        
        await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      }

      // 3. Refresh schedules
      await fetchSchedules()
      setDialogOpen(false)
      setSelectedUserId("")
      setUserSchedule([])
      
      toast({
        title: "Sucesso",
        description: "Horários salvos com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao salvar horários:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar horários. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedUser = users.find(u => u.id === parseInt(selectedUserId))
  const totalScheduledMinutes = userSchedule.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(":").map(Number)
    const [eh, em] = s.endTime.split(":").map(Number)
    return sum + ((eh * 60 + em) - (sh * 60 + sm))
  }, 0)
  const totalScheduledHours = totalScheduledMinutes / 60
  const requiredHours = selectedUser?.weekHours || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Grade Semanal de Horários
        </CardTitle>
        <CardDescription>
          Visualize e gerencie os horários dos usuários no laboratório
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {schedules.length} horários cadastrados
            </span>
          </div>
          <Button onClick={() => setDialogOpen(true)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Definir Horários
          </Button>
        </div>

        {/* Dialog para definir horários */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Definir Horários do Usuário</DialogTitle>
              <DialogDescription>
                Configure os dias e horários em que o usuário deve estar no laboratório
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Selecionar Usuário</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => u.status === 'active').map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUserId && (
                <div className="space-y-3">
                  <div className="font-medium">Dias da Semana</div>
                  <div className="grid grid-cols-1 gap-3">
                    {WEEK_DAYS.map((day, idx) => {
                      const checked = userSchedule.some(s => s.dayOfWeek === idx)
                      return (
                        <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => handleDayChange(idx, e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="font-medium">{day}</span>
                          </div>
                          
                          {checked && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={userSchedule.find(s => s.dayOfWeek === idx)?.startTime ?? ""}
                                onChange={e => handleTimeChange(idx, "startTime", e.target.value)}
                                className="w-32"
                              />
                              <span className="text-muted-foreground">até</span>
                              <Input
                                type="time"
                                value={userSchedule.find(s => s.dayOfWeek === idx)?.endTime ?? ""}
                                onChange={e => handleTimeChange(idx, "endTime", e.target.value)}
                                className="w-32"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedUser && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">Horas semanais obrigatórias:</span> {requiredHours.toFixed(1)}h
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Horas agendadas:</span> {totalScheduledHours.toFixed(2)}h
                  </div>
                  
                  {totalScheduledHours < requiredHours && (
                    <div className="mt-2 flex items-center gap-2 text-yellow-800 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>O total de horas agendadas está abaixo do mínimo semanal para este usuário.</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!selectedUserId || userSchedule.length === 0 || saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Grade de horários */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
              Carregando horários...
            </div>
          ) : (
            <table className="min-w-full border text-xs">
              <thead>
                <tr>
                  <th className="px-3 py-2 border-b bg-blue-50 text-left font-medium">Horário</th>
                  {WEEK_DAYS.map((day) => (
                    <th key={day} className="px-3 py-2 border-b bg-blue-50 text-center font-medium">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot.start + slot.end}>
                    <td className="px-3 py-2 border-r text-right align-middle whitespace-nowrap border-b-2 font-medium">
                      {slot.start}<br />{slot.end}
                    </td>
                    {WEEK_DAYS.map((_, dayIdx) => {
                      const slotSchedules = schedules.filter((s) => {
                        if (s.dayOfWeek !== dayIdx) return false
                        return s.startTime < slot.end && s.endTime > slot.start
                      })
                      
                      return (
                        <td key={dayIdx} className="px-2 py-2 border align-top min-w-[120px]">
                          {slotSchedules.length === 0 ? (
                            <span className="text-muted-foreground text-center block">-</span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {slotSchedules.map((s) => {
                                const user = users.find((u) => u.id === s.userId)
                                return (
                                  <div
                                    key={s.id}
                                    className={`group rounded border px-2 py-1 text-xs font-medium ${getUserColor(s.userId)} flex items-center justify-between gap-1`}
                                  >
                                    <span className="truncate">{user?.name || "Usuário"}</span>
                                    <span className="ml-1 text-[10px] text-muted-foreground whitespace-nowrap">
                                      ({s.startTime} - {s.endTime})
                                    </span>
                                    <button
                                      onClick={() => handleDelete(s.id)}
                                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                                      title="Remover"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
