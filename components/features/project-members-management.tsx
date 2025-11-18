"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/contexts/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { 
  Users, 
  UserMinus, 
  UserPlus, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3
} from "lucide-react"
import type { Project } from "@/contexts/types"

interface ProjectMember {
  id: number
  userId: number
  userName: string
  userEmail: string
  roles: string[]
  joinedAt: string
  totalHours?: number
  currentWeekHours?: number
}

interface ProjectMembersManagementProps {
  project: Project
  onUpdate?: () => void
}

export function ProjectMembersManagement({ project, onUpdate }: ProjectMembersManagementProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [showHoursDialog, setShowHoursDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null)
  const [newMemberUserId, setNewMemberUserId] = useState<string>("")
  const [newMemberRole, setNewMemberRole] = useState<string>("COLABORADOR")
  const [manualHours, setManualHours] = useState<number>(0)
  const [hoursDate, setHoursDate] = useState<string>("")

  const isCoordinatorOrManager = user?.roles?.includes('COORDENADOR') || user?.roles?.includes('GERENTE')

  // Buscar membros do projeto
  useEffect(() => {
    fetchProjectMembers()
    if (isCoordinatorOrManager) {
      fetchAvailableUsers()
    }
  }, [project.id])

  const fetchProjectMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${project.id}/members`)
      const data = await response.json()
      
      if (response.ok) {
        setMembers(data.members || [])
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao carregar membros",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao buscar membros:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar membros do projeto",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok) {
        // Filtrar usuários que não estão no projeto
        const currentMemberIds = members.map(m => m.userId)
        const available = data.users.filter((user: any) => 
          !currentMemberIds.includes(user.id) && user.status === 'active'
        )
        setAvailableUsers(available)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários disponíveis:', error)
    }
  }

  const handleAddMember = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(newMemberUserId),
          roles: [newMemberRole]
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Membro adicionado ao projeto com sucesso!",
        })
        setShowAddDialog(false)
        setNewMemberUserId("")
        setNewMemberRole("COLABORADOR")
        fetchProjectMembers()
        onUpdate?.()
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao adicionar membro",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar membro:', error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar membro ao projeto",
        variant: "destructive"
      })
    }
  }

  const handleRemoveMember = async () => {
    if (!selectedMember) return

    try {
      const response = await fetch(`/api/projects/${project.id}/members/${selectedMember.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Membro removido do projeto com sucesso!",
        })
        setShowRemoveDialog(false)
        setSelectedMember(null)
        fetchProjectMembers()
        onUpdate?.()
      } else {
        const data = await response.json()
        toast({
          title: "Erro",
          description: data.error || "Erro ao remover membro",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error)
      toast({
        title: "Erro",
        description: "Erro ao remover membro do projeto",
        variant: "destructive"
      })
    }
  }

  const handleAddManualHours = async () => {
    if (!selectedMember || !hoursDate || manualHours <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/work-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedMember.userId,
          userName: selectedMember.userName,
          activity: "Horas adicionadas manualmente",
          location: "Sistema",
          projectId: project.id,
          startTime: new Date(`${hoursDate}T09:00:00.000Z`),
          endTime: new Date(`${hoursDate}T${9 + manualHours}:00:00.000Z`),
          duration: manualHours,
          status: "completed"
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `${manualHours}h adicionadas para ${selectedMember.userName}`,
        })
        setShowHoursDialog(false)
        setSelectedMember(null)
        setManualHours(0)
        setHoursDate("")
        fetchProjectMembers()
        onUpdate?.()
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao adicionar horas",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar horas:', error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar horas manualmente",
        variant: "destructive"
      })
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'COORDENADOR': 'Coordenador',
      'GERENTE': 'Gerente',
      'GERENTE_PROJETO': 'Gerente de Projeto',
      'PESQUISADOR': 'Pesquisador',
      'COLABORADOR': 'Colaborador',
      'VOLUNTARIO': 'Voluntário'
    }
    return roleNames[role] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'COORDENADOR': return 'default'
      case 'GERENTE': return 'default'
      case 'GERENTE_PROJETO': return 'secondary'
      case 'PESQUISADOR': return 'outline'
      case 'COLABORADOR': return 'outline'
      case 'VOLUNTARIO': return 'outline'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando membros...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros do Projeto
          </CardTitle>
          {isCoordinatorOrManager && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Membro ao Projeto</DialogTitle>
                  <DialogDescription>
                    Selecione um usuário para adicionar ao projeto {project.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="user">Usuário</Label>
                    <Select value={newMemberUserId} onValueChange={setNewMemberUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role">Função</Label>
                    <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                        <SelectItem value="PESQUISADOR">Pesquisador</SelectItem>
                        <SelectItem value="GERENTE_PROJETO">Gerente de Projeto</SelectItem>
                        <SelectItem value="VOLUNTARIO">Voluntário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddMember} disabled={!newMemberUserId}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <CardDescription>
          {members.length} membro{members.length !== 1 ? 's' : ''} no projeto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="hours">Horas Trabalhadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="space-y-4">
            {members.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum membro encontrado</h3>
                <p className="text-muted-foreground">
                  Este projeto ainda não possui membros.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.userName}</div>
                        <div className="text-sm text-muted-foreground">{member.userEmail}</div>
                        <div className="flex gap-1 mt-1">
                          {member.roles.map((role) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                              {getRoleDisplayName(role)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    {isCoordinatorOrManager && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member)
                            setShowHoursDialog(true)
                          }}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Horas
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedMember(member)
                            setShowRemoveDialog(true)
                          }}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="hours" className="space-y-4">
            <div className="grid gap-4">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.roles.map(getRoleDisplayName).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{member.totalHours || 0}h</div>
                        <div className="text-sm text-muted-foreground">
                          Esta semana: {member.currentWeekHours || 0}h
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog para remover membro */}
        <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover Membro</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover <strong>{selectedMember?.userName}</strong> do projeto?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleRemoveMember}>
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para adicionar horas */}
        <Dialog open={showHoursDialog} onOpenChange={setShowHoursDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Horas</DialogTitle>
              <DialogDescription>
                Adicionar horas trabalhadas para <strong>{selectedMember?.userName}</strong> no projeto {project.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={hoursDate}
                  onChange={(e) => setHoursDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hours">Horas</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={manualHours}
                  onChange={(e) => setManualHours(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 8.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHoursDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddManualHours} disabled={!hoursDate || manualHours <= 0}>
                Adicionar Horas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
