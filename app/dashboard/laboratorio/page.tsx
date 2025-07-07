"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import { useResponsibility } from "@/lib/responsibility-context"
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

  const [date, setDate] = useState<Date>(new Date())
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [notes, setNotes] = useState("")
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [selectedResponsibility, setSelectedResponsibility] = useState<string | null>(null)

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
    }
  }, [user, fetchResponsibilities, fetchActiveResponsibility])

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
      await updateNotes(selectedResponsibility, notes)
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

  // Função para destacar dias no calendário com responsabilidades
  const isDayWithResponsibility = (day: Date) => {
    return responsibilities.some((resp) => {
      const start = parseISO(resp.startTime)
      const end = resp.endTime ? parseISO(resp.endTime) : new Date()

      // Verificar se o dia está dentro do intervalo ou é o mesmo dia
      return isWithinInterval(day, { start, end }) || isSameDay(day, start) || (resp.endTime && isSameDay(day, end))
    })
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
                <CardDescription>Controle de responsabilidade pelo laboratório</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : activeResponsibility ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="success" className="bg-green-500">
                        Ativo
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Desde {format(new Date(activeResponsibility.startTime), "dd/MM/yyyy HH:mm")}
                      </span>
                    </div>

                    <div className="flex items-center justify-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-2xl font-mono">{formatDuration(activeResponsibility.duration)}</span>
                    </div>

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
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center py-2">
                      <Badge variant="outline">Laboratório disponível</Badge>
                    </div>

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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Calendário */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Calendário de Responsabilidades</CardTitle>
              <CardDescription>Visualize os dias em que houve responsáveis pelo laboratório</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  locale={ptBR}
                  modifiers={{
                    withResponsibility: (date) => isDayWithResponsibility(date),
                  }}
                  modifiersClassNames={{
                    withResponsibility: "bg-primary/20 font-bold",
                  }}
                  className="rounded-md border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Histórico de responsabilidades */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Histórico de Responsabilidades</CardTitle>
              <CardDescription>
                Registro de todas as responsabilidades do mês de {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
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
                  {responsibilities.map((responsibility) => (
                    <Card key={responsibility.id} className="overflow-hidden">
                      <div className="p-4 border-l-4 border-primary">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{responsibility.userName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(responsibility.startTime), "dd/MM/yyyy HH:mm")}
                              {responsibility.endTime
                                ? ` até ${format(new Date(responsibility.endTime), "dd/MM/yyyy HH:mm")}`
                                : " (Em andamento)"}
                            </p>
                          </div>
                          <Badge variant={responsibility.endTime ? "secondary" : "success"}>
                            {responsibility.endTime ? "Concluído" : "Ativo"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Duração: {calculateDuration(responsibility.startTime, responsibility.endTime)}</span>
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
      </main>
    </div>
  )
}
