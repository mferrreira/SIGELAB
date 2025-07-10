"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Task, TaskFormData, User, Project } from "@/lib/types"

interface TaskFormProps {
  task?: Task | null
  users: User[]
  projects: Project[]
  currentUser: User | null
  onSubmit: (formData: TaskFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  error: string | null
  projectId?: string
}

/**
 * Form field component for basic input fields
 */
interface FormFieldProps {
  label: string
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  required?: boolean
  placeholder?: string
  type?: string
  min?: string | number
  rows?: number
  error?: string
}

/**
 * Number input field component
 */
interface NumberFieldProps {
  label: string
  id: string
  name: string
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  min?: number
}

function FormField({ 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  required = false, 
  placeholder, 
  type = "text",
  min,
  rows,
  error
}: FormFieldProps) {
  const InputComponent = rows ? Textarea : Input
  const inputProps = rows ? { rows } : { type, min }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}{required && " *"}</Label>
      <InputComponent
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        {...inputProps}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

function NumberField({ 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  min 
}: NumberFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="number"
        min={min}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

/**
 * Select field component for dropdown selections
 */
interface SelectFieldProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: Array<{ value: string; label: string }>
}

function SelectField({ label, value, onValueChange, placeholder, options }: SelectFieldProps) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * Form actions component for submit and cancel buttons
 */
interface FormActionsProps {
  isSubmitting: boolean
  onCancel: () => void
  isEdit: boolean
}

function FormActions({ isSubmitting, onCancel, isEdit }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
      </Button>
    </div>
  )
}

/**
 * Main TaskForm component
 */
export function TaskForm({
  task,
  users,
  projects,
  currentUser,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  projectId,
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: "",
    project: "",
    dueDate: "",
    points: 10,
    completed: false,
  })

  const [isPastDate, setIsPastDate] = useState(false)

  const checkIfPastDate = useCallback((dateString: string | null) => {
    if (!dateString) {
      setIsPastDate(false)
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const selectedDate = new Date(dateString)
    setIsPastDate(selectedDate < today)
  }, [])

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status as TaskFormData["status"],
        priority: task.priority as TaskFormData["priority"],
        assignedTo: task.assignedTo?.toString() || "",
        project: task.projectId?.toString() || "",
        dueDate: task.dueDate || "",
        points: task.points,
        completed: task.completed || false,
      })
      checkIfPastDate(task.dueDate || null)
    } else {
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignedTo: currentUser?.role === "responsible" ? currentUser.id.toString() : "",
        project: projectId || "",
        dueDate: "",
        points: 10,
        completed: false,
      })
      setIsPastDate(false)
    }
  }, [task, currentUser, projectId, checkIfPastDate])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "dueDate") {
      checkIfPastDate(value)
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [checkIfPastDate])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }, [formData, onSubmit])

  // Options for select fields
  const statusOptions = [
    { value: "todo" as const, label: "A Fazer" },
    { value: "in-progress" as const, label: "Em Andamento" },
    { value: "in-review" as const, label: "Em Revisão" },
    { value: "adjust" as const, label: "Ajustes" },
    { value: "done" as const, label: "Concluído" },
  ]

  const priorityOptions = [
    { value: "low" as const, label: "Baixa" },
    { value: "medium" as const, label: "Média" },
    { value: "high" as const, label: "Alta" },
  ]

  const userOptions = users.map((user) => ({
    value: user.id.toString(),
    label: user.name,
  }))

  const projectOptions = projects.map((project) => ({
    value: project.id.toString(),
    label: project.name,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormField
        label="Título"
        id="title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="Digite o título da tarefa"
      />

      <FormField
        label="Descrição"
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Digite a descrição da tarefa"
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Status"
          value={formData.status}
          onValueChange={(value) => handleSelectChange("status", value)}
          options={statusOptions}
        />

        <SelectField
          label="Prioridade"
          value={formData.priority}
          onValueChange={(value) => handleSelectChange("priority", value)}
          options={priorityOptions}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Responsável"
          value={formData.assignedTo}
          onValueChange={(value) => handleSelectChange("assignedTo", value)}
          placeholder="Selecione um responsável"
          options={userOptions}
        />

        <SelectField
          label="Projeto"
          value={formData.project}
          onValueChange={(value) => handleSelectChange("project", value)}
          placeholder="Selecione um projeto"
          options={projectOptions}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Data de Vencimento"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          type="date"
          error={isPastDate ? "A data selecionada já passou" : undefined}
        />

        <NumberField
          label="Pontos"
          id="points"
          name="points"
          value={formData.points}
          onChange={handleNumberChange}
          min={0}
        />
      </div>

      <FormActions
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        isEdit={!!task}
      />
    </form>
  )
} 