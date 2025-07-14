"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AppHeader } from "@/components/app-header"
import { useResponsibility } from "@/contexts/responsibility-context"
import { useDailyLogs } from "@/contexts/daily-log-context"
import { useLaboratorySchedule } from "@/contexts/laboratory-schedule-context"
import { useLabEvents } from "@/contexts/lab-events-context";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, Play, Square, AlertCircle, FileText } from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Tooltip } from "@/components/ui/tooltip"
import DayViewCalendar from "@/components/ui/day-view-calendar"
import { Input } from "@/components/ui/input"
import { LaboratorySchedule } from "@/components/laboratory-schedule"

export default function LabResponsibilityPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const {
    responsibilities,
    activeResponsibility,
    loading,
    error,
    fetchResponsibilities,
    fetchActiveResponsibility,
    startResponsibility,
    endResponsibility,
    updateNotes,
  } = useResponsibility()

  const { logs: dailyLogs, loading: logsLoading, createLog, fetchAllLogs, fetchProjectLogs, fetchLogs } = useDailyLogs()
  const { schedules: labSchedules, getSchedulesByDay } = useLaboratorySchedule()
  const { events: labEvents, fetchEvents, createEvent, loading: eventsLoading, error: eventsError } = useLabEvents();

  const [date, setDate] = useState<Date | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [notes, setNotes] = useState("")
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [selectedResponsibility, setSelectedResponsibility] = useState<string | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [eventDialogTime, setEventDialogTime] = useState<string>("")
  const [eventDialogType, setEventDialogType] = useState<"log"|"responsibility">("log")
  const [eventDialogNote, setEventDialogNote] = useState("")
  const [editingEvent, setEditingEvent] = useState<any|null>(null)

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Carregar responsabilidades e responsabilidade ativa
  useEffect(() => {
    if (user) {
      fetchResponsibilities()
      fetchActiveResponsibility()
      
      // Role-based log fetching
      if (user.role === "administrador_laboratorio" || user.role === "laboratorista") {
        // Admins and laboratorists see all logs
        fetchAllLogs()
      } else if (user.role === "gerente_projeto") {
        // Project managers see logs from their projects
        // For now, we'll show all logs but this can be enhanced to filter by user's projects
        fetchAllLogs()
      } else if (user.role === "voluntario") {
        // Volunteers only see their own logs
        fetchLogs(user.id)
      }
    }
  }, [user, fetchResponsibilities, fetchActiveResponsibility, fetchAllLogs, fetchLogs])

  useEffect(() => {
    setDate(new Date())
  }, [])

  useEffect(() => {
    if (date) {
      fetchEvents(date)
    }
  }, [date, fetchEvents])

  // Quando o mês muda, buscar responsabilidades para o novo período
  useEffect(() => {
    if (user && date) {
      const start = startOfMonth(date).toISOString()
      const end = endOfMonth(date).toISOString()
      fetchResponsibilities(start, end)
    }
  }, [user, date, fetchResponsibilities])

  const handleStartResponsibility = async () => {
    try {
      setIsStarting(true)
      await startResponsibility(notes)
      setNotes("")
    } catch (err) {
      console.error("Erro ao iniciar responsabilidade:", err)
    } finally {
      setIsStarting(false)
    }
  }

  const handleEndResponsibility = async () => {
    try {
      setIsEnding(true)
      await endResponsibility()
    } catch (err) {
      console.error("Erro ao encerrar responsabilidade:", err)
    } finally {
      setIsEnding(false)
    }
  }

  const handleUpdateNotes = async () => {
    if (!selectedResponsibility) return

    try {
      await updateNotes(parseInt(selectedResponsibility), notes)
      setIsNotesDialogOpen(false)
      setSelectedResponsibility(null)
      setNotes("")
    } catch (err) {
      console.error("Erro ao atualizar notas:", err)
    }
  }

  const openNotesDialog = (responsibility: any) => {
    setSelectedResponsibility(responsibility.id)
    setNotes(responsibility.notes || "")
    setIsNotesDialogOpen(true)
  }

  // Função para formatar duração em hh:mm:ss
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":")
  }

  // Função para calcular a duração entre duas datas
  const calculateDuration = (startTime: string, endTime: string | null): string => {
    const start = new Date(startTime).getTime()
    const end = endTime ? new Date(endTime).getTime() : Date.now()
    const durationInSeconds = Math.floor((end - start) / 1000)
    return formatDuration(durationInSeconds)
  }

  // Função para destacar dias no calendário com responsabilidades ou daily log
  const isDayWithResponsibility = (day: Date) => {
    // Guard against undefined/null day
    if (!day || !(day instanceof Date)) {
      return { hasResponsibility: false, hasDailyLog: false }
    }
    
    const hasResponsibility = responsibilities.some((resp) => {
      const start = parseISO(resp.startTime)
      const end = resp.endTime ? parseISO(resp.endTime) : new Date()
      return isWithinInterval(day, { start, end }) || isSameDay(day, start) || (resp.endTime && isSameDay(day, end))
    })
    const hasDailyLog = dailyLogs.some((log) => isSameDay(day, new Date(log.date)))
    return { hasResponsibility, hasDailyLog }
  }

  // Memoize formatted active responsibility start time
  const formattedActiveStartTime = useMemo(() =>
    activeResponsibility ? format(new Date(activeResponsibility.startTime), "dd/MM/yyyy HH:mm") : ""
  , [activeResponsibility])

  // Memoize formatted responsibilities
  const formattedResponsibilities = useMemo(() =>
    responsibilities.map((responsibility) => ({
      ...responsibility,
      formattedStart: format(new Date(responsibility.startTime), "dd/MM/yyyy HH:mm"),
      formattedEnd: responsibility.endTime ? format(new Date(responsibility.endTime), "dd/MM/yyyy HH:mm") : null,
      duration: calculateDuration(responsibility.startTime, responsibility.endTime || null),
    }))
  , [responsibilities])

  // Build events for the selected day
  const events = useMemo(() => {
    const currentDate = date || new Date()
    // Get laboratory schedules for this day
    const dayOfWeek = currentDate.getDay()
    const daySchedules = getSchedulesByDay(dayOfWeek)
    // Create laboratory schedule events
    const labScheduleEvents = daySchedules.map(schedule => ({
      time: schedule.startTime,
      note: schedule.notes || `Horário do laboratório: ${schedule.startTime} - ${schedule.endTime}`,
      type: "laboratory" as const
    }))
    const labEndEvents = daySchedules.map(schedule => ({
      time: schedule.endTime,
      note: `Fim do horário: ${schedule.startTime} - ${schedule.endTime}`,
      type: "laboratory" as const
    }))
    // Lab public events
    const publicEvents = labEvents
      .filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === currentDate.toDateString()
      })
      .map(event => ({
        time: new Date(event.date).toTimeString().slice(0,5),
        note: event.note,
        type: "event" as const,
        userName: event.userName
      }))
    return [...labScheduleEvents, ...labEndEvents, ...publicEvents]
  }, [labEvents, date, getSchedulesByDay])

  // Handle add event
  const handleAddEvent = async (time: string, note: string) => {
    if (!user) return
    const eventDate = new Date(date || new Date())
    const [h, m] = time.split(":").map(Number)
    eventDate.setHours(h, m, 0, 0)
    await createEvent({ date: eventDate.toISOString(), note })
    await fetchEvents(eventDate)
    setShowEventDialog(false)
  }

  // Handle edit event (optional, for future inline editing)
  // const handleEditEvent = (event: DayViewEvent) => {
  //   setEventDialogTime(event.time)
  //   setEventDialogType(event.type || "log")
  //   setEventDialogNote(event.note || "")
  //   setEditingEvent(event)
  //   setShowEventDialog(true)
  // }

  // Save event (log or responsibility)
  const handleSaveEvent = async () => {
    if (!user) return
    const eventDate = new Date(date || new Date())
    const [h, m] = eventDialogTime.split(":").map(Number)
    eventDate.setHours(h, m, 0, 0)
    await createEvent({ date: eventDate.toISOString(), note: eventDialogNote })
    await fetchEvents(eventDate)
    setShowEventDialog(false)
  }

  // Handle day change
  const handleDateChange = (newDate: Date) => {
    setDate(newDate)
  }

  if (authLoading) {
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
        <h1 className="text-2xl font-bold mb-6">Responsabilidade do Laboratório</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna 1: Status atual e controles */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status Atual</CardTitle>
                <CardDescription>
                  {user?.role === "administrador_laboratorio" || user?.role === "laboratorista" 
                    ? "Controle de responsabilidade pelo laboratório" 
                    : "Visualização do status do laboratório"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : activeResponsibility ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="default">
                        Ativo
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Desde {formattedActiveStartTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-2xl font-mono">{activeResponsibility.duration}</span>
                    </div>

                            {/* Only show control buttons for administrador de laboratório and laboratorista */}
        {(user?.role === "administrador_laboratorio" || user?.role === "laboratorista") && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleEndResponsibility}
                        disabled={isEnding}
                      >
                        {isEnding ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Square className="h-4 w-4 mr-2" />
                        )}
                        Não sou mais responsável
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center py-2">
                      <Badge variant="outline">Laboratório disponível</Badge>
                    </div>

                            {/* Only show start controls for administrador de laboratório and laboratorista */}
        {(user?.role === "administrador_laboratorio" || user?.role === "laboratorista") ? (
                      <>
                        <Textarea
                          placeholder="Notas (opcional)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="resize-none"
                          rows={3}
                        />

                        <Button
                          variant="default"
                          className="w-full"
                          onClick={handleStartResponsibility}
                          disabled={isStarting}
                        >
                          {isStarting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          Estar responsável
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        Apenas laboratoristas e administradores de laboratório podem assumir responsabilidade pelo laboratório.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Day View Calendar */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Agenda do Dia</CardTitle>
                <CardDescription>
                  Slots padrão e eventos do dia selecionado. Clique em "+ Adicionar evento" para registrar um log ou responsabilidade.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DayViewCalendar
                  date={date || new Date()}
                  events={events}
                  labSchedules={labSchedules}
                  onAddEvent={(slot) => {
                    setEventDialogTime(slot)
                    setShowEventDialog(true)
                  }}
                  onDateChange={handleDateChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Horários do Laboratório */}
          <Card className="md:col-span-3">
            <LaboratorySchedule />
          </Card>

          {/* Histórico de responsabilidades */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Histórico de Responsabilidades</CardTitle>
              <CardDescription>
                Registro de todas as responsabilidades do mês de {format(date || new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : responsibilities.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma responsabilidade registrada neste período.
                </div>
              ) : (
                <div className="space-y-4">
                  {formattedResponsibilities.map((responsibility) => (
                    <Card key={responsibility.id} className="overflow-hidden">
                      <div className="p-4 border-l-4 border-primary">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{responsibility.userName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {responsibility.formattedStart}
                              {responsibility.formattedEnd
                                ? ` até ${responsibility.formattedEnd}`
                                : " (Em andamento)"}
                            </p>
                          </div>
                          <Badge variant={responsibility.endTime ? "secondary" : "default"}>
                            {responsibility.endTime ? "Concluído" : "Ativo"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Duração: {responsibility.duration}</span>
                        </div>

                        {responsibility.notes && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <p className="text-sm">{responsibility.notes}</p>
                          </div>
                        )}

                        <div className="mt-2">
                          <Button variant="ghost" size="sm" onClick={() => openNotesDialog(responsibility)}>
                            <FileText className="h-4 w-4 mr-2" />
                            {responsibility.notes ? "Editar notas" : "Adicionar notas"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Diálogo para editar notas */}
        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notas da Responsabilidade</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="Adicione notas sobre esta responsabilidade..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={5}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateNotes}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal for adding/editing event */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Editar Evento" : "Adicionar Evento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                <Input type="time" value={eventDialogTime} onChange={e => setEventDialogTime(e.target.value)} className="w-32" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
                <Input
                  value={eventDialogNote}
                  onChange={e => setEventDialogNote(e.target.value)}
                  placeholder="Digite uma nota (opcional)"
                />
              </div>
            </div>
            <DialogFooter>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSaveEvent}
              >
                Salvar
              </button>
              <button
                className="ml-2 px-4 py-2 rounded border"
                onClick={() => setShowEventDialog(false)}
              >
                Cancelar
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {showEventDialog && (
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Evento Público</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="time"
                  value={eventDialogTime}
                  onChange={e => setEventDialogTime(e.target.value)}
                />
                <Textarea
                  placeholder="Descrição do evento"
                  value={eventDialogNote}
                  onChange={e => setEventDialogNote(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>Cancelar</Button>
                <Button onClick={() => handleAddEvent(eventDialogTime, eventDialogNote)} disabled={!eventDialogNote.trim()}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
