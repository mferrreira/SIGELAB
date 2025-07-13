import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useWorkSessions } from "@/lib/work-session-context"
import { useDailyLogs } from "@/lib/daily-log-context"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Play, StopCircle, Clock, MapPin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TimerCardProps {
  onSessionEnd?: () => void
}

export function TimerCard({ onSessionEnd }: TimerCardProps) {
  const { user } = useAuth()
  const { activeSession, startSession, endSession, loading, fetchSessions, sessions } = useWorkSessions()
  const { createLog } = useDailyLogs()
  const [activity, setActivity] = useState("")
  const [location, setLocation] = useState("")
  const [timer, setTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [logNote, setLogNote] = useState("")
  const [submittingLog, setSubmittingLog] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)

  // Always fetch sessions on mount
  useEffect(() => {
    if (user) fetchSessions(user.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Start timer if session is active
  useEffect(() => {
    if (activeSession && activeSession.startTime) {
      const start = new Date(activeSession.startTime).getTime()
      setTimer(Math.floor((Date.now() - start) / 1000))
      if (!timerInterval) {
        const interval = setInterval(() => {
          setTimer(Math.floor((Date.now() - start) / 1000))
        }, 1000)
        setTimerInterval(interval)
      }
    } else {
      setTimer(0)
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession])

  // Debug logging
  useEffect(() => {
    console.log('DEBUG TimerCard:', { user, activeSession, sessions })
  }, [user, activeSession, sessions])

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }, [timerInterval])

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (!user) throw new Error("Usuário não autenticado")
      await startSession({ userId: user.id, activity, location })
      setActivity("")
      setLocation("")
      await fetchSessions(user.id)
    } catch (err: any) {
      setError(err.message || "Erro ao iniciar sessão")
      await fetchSessions(user?.id)
    }
  }

  const handleEnd = async () => {
    setError(null)
    try {
      const endTime = new Date()
      const startTime = activeSession?.startTime ? new Date(activeSession.startTime) : new Date()
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      setSessionDuration(duration)
      
      await endSession(activeSession!.id, activity)
      setShowLogDialog(true)
      if (onSessionEnd) onSessionEnd()
      await fetchSessions(user?.id)
    } catch (err: any) {
      setError(err.message || "Erro ao finalizar sessão")
    }
  }

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !logNote.trim()) return
    
    setSubmittingLog(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      await createLog({
        userId: user.id,
        date: today,
        note: logNote.trim()
      })
      
      setShowLogDialog(false)
      setLogNote("")
      setSessionDuration(0)
      fetchSessions(user?.id)
    } catch (err) {
      console.error("Erro ao salvar log:", err)
      setError("Erro ao salvar registro de atividade")
    } finally {
      setSubmittingLog(false)
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return [h, m, s]
      .map((v) => v.toString().padStart(2, "0"))
      .join(":")
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) {
      return `${h}h ${m}min`
    }
    return `${m}min`
  }

  return (
    <>
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Timer de Atividade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <div className="flex flex-col items-start space-y-4 w-full">
              <div className="text-3xl font-mono text-blue-900 font-bold">
                {formatTime(timer)}
              </div>
              
              <div className="w-full space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Atividade:</span> 
                  <span>{activeSession.activity || "Trabalho geral"}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Local:</span> 
                  <span>{activeSession.location || "Não especificado"}</span>
                </div>
              </div>
              
              <Button
                variant="destructive"
                className="mt-4 w-full h-12 text-lg font-bold bg-red-600 hover:bg-red-700"
                onClick={handleEnd}
                disabled={loading}
              >
                <StopCircle className="h-5 w-5 mr-2" />
                Encerrar Sessão
              </Button>
              
              {error && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <form className="flex flex-col space-y-3" onSubmit={handleStart}>
              <div className="space-y-2">
                <Input
                  placeholder="Descreva a atividade (opcional)"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  disabled={loading}
                  className="border-blue-300 focus:border-blue-500"
                />
                <Input
                  placeholder="Local (lab, home, remoto...)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                  className="border-blue-300 focus:border-blue-500"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Sessão
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </Button>
              
              {error && (
                <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                  {error}
                </div>
              )}
            </form>
          )}
        </CardContent>
      </Card>

      {/* Activity Log Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Registrar Atividade</span>
            </DialogTitle>
            <DialogDescription>
              Sessão finalizada com duração de <strong>{formatDuration(sessionDuration)}</strong>. 
              Descreva o que você realizou durante este período.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="logNote" className="text-sm font-medium text-gray-700">
                Descrição da atividade
              </label>
              <Textarea
                id="logNote"
                placeholder="Descreva as tarefas realizadas, projetos trabalhados, ou atividades desenvolvidas..."
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                className="min-h-[100px] border-blue-300 focus:border-blue-500"
                autoFocus
                required
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLogDialog(false)}
                disabled={submittingLog}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submittingLog || !logNote.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submittingLog ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Registro"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 