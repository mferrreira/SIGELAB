"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, User } from "lucide-react"
import { useResponsibility } from "@/lib/responsibility-context"

// Função para formatar duração em hh:mm:ss
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":")
}

export function LabResponsibilityStatus() {
  const { activeResponsibility, loading, error, fetchActiveResponsibility } = useResponsibility()
  const [formattedStartTime, setFormattedStartTime] = useState("")

  // Buscar responsabilidade ativa ao montar o componente
  useEffect(() => {
    fetchActiveResponsibility()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeResponsibility?.startTime) {
      setFormattedStartTime(new Date(activeResponsibility.startTime).toLocaleTimeString())
    } else {
      setFormattedStartTime("")
    }
  }, [activeResponsibility?.startTime])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Carregando...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-destructive">
          <p>Erro ao carregar status do laboratório</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        {activeResponsibility ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="default" className="bg-green-500">
                Laboratório em uso
              </Badge>
              <span className="text-sm text-muted-foreground">
                Desde {formattedStartTime}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">{activeResponsibility.userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-mono text-lg">{formatDuration(activeResponsibility.duration)}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <Badge variant="outline" className="mb-2">
              Laboratório disponível
            </Badge>
            <p className="text-sm text-muted-foreground">Ninguém está responsável pelo laboratório no momento.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
