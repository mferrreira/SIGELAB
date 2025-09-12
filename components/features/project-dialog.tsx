"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useProject } from "@/contexts/project-context"
import type { Project, ProjectFormData } from "@/contexts/types"

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
}

export function ProjectDialog({ open, onOpenChange, project = null }: ProjectDialogProps) {
  const { user } = useAuth()
  const { createProject, updateProject } = useProject()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    status: "active",
    links: [], // Add links array to form state
  })

  // Reset form when dialog opens/closes or project changes
  useEffect(() => {
    if (open && project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        status: project.status,
        links: project.links || [], // Initialize links from project if editing
      })
    } else if (open) {
      setFormData({
        name: "",
        description: "",
        status: "active",
        links: [],
      })
    }
    setError(null)
  }, [open, project])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as "active" | "completed" | "archived" }))
  }

  // Handle dynamic links
  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    setFormData((prev) => {
      const links = [...(prev.links || [])]
      links[index] = { ...links[index], [field]: value }
      return { ...prev, links }
    })
  }
  const handleAddLink = () => {
    setFormData((prev) => ({ ...prev, links: [...(prev.links || []), { label: "", url: "" }] }))
  }
  const handleRemoveLink = (index: number) => {
    setFormData((prev) => {
      const links = [...(prev.links || [])]
      links.splice(index, 1)
      return { ...prev, links }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setIsSubmitting(true)
      setError(null)

      if (project) {
        await updateProject(project.id, formData)
      } else {
        await createProject(formData)
      }

      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar projeto")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isSubmitting && onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{project ? "Editar Projeto" : "Adicionar Novo Projeto"}</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Digite o nome do projeto"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Digite a descrição do projeto"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Links</Label>
              {(formData.links || []).map((link, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Nome (ex: Figma, GitHub)"
                    value={link.label}
                    onChange={e => handleLinkChange(idx, "label", e.target.value)}
                    className="w-1/3"
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={e => handleLinkChange(idx, "url", e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="destructive" onClick={() => handleRemoveLink(idx)}>-</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddLink}>
                + Adicionar Link
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : project ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
