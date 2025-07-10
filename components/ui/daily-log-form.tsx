"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { DailyLogFormData } from "@/lib/types"

interface DailyLogFormProps {
  initialNote?: string
  onSubmit: (formData: DailyLogFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  error: string | null
  userId: number
  date: string
}

export function DailyLogForm({
  initialNote = "",
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  userId,
  date,
}: DailyLogFormProps) {
  const [note, setNote] = useState(initialNote)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!note.trim()) {
      return
    }

    await onSubmit({
      userId,
      date,
      note: note.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        <Label htmlFor="note">Registro do dia</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Descreva suas atividades do dia..."
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !note.trim()}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
} 