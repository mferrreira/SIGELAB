"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  UserPlus, 
  UserMinus, 
  Mail, 
  Search,
  Check,
  X,
  AlertTriangle
} from "lucide-react"
import { useProject } from "@/contexts/project-context"
import { fetchAPI } from "@/contexts/api-client"

interface User {
  id: number
  name: string
  email: string
  avatar?: string
  roles: string[]
  isMember: boolean
  isLeader: boolean
}

interface VolunteerActionsProps {
  projectId: number
  onVolunteerAdded?: (userId: number) => void
  onVolunteerRemoved?: (userId: number) => void
}

export function VolunteerActions({ projectId, onVolunteerAdded, onVolunteerRemoved }: VolunteerActionsProps) {
  const { projects } = useProject()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("COLABORADOR")
  const [loading, setLoading] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Buscar projeto atual
  const currentProject = projects.find(p => p.id === projectId)
  if (!currentProject) return null

  // Buscar usuários disponíveis
  const loadAvailableUsers = async (search: string = "") => {
    setSearchLoading(true)
    try {
      const response = await fetchAPI(`/api/users?search=${encodeURIComponent(search)}&excludeProjectId=${projectId}`)
      if (response.success) {
        const users = response.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          roles: user.roles || [],
          isMember: false, // Já filtrados pela API
          isLeader: currentProject.leaderId === user.id
        }))
        setAvailableUsers(users)
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  // Carregar usuários quando o dialog abrir
  const handleAddDialogOpen = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (open) {
      loadAvailableUsers(searchTerm)
    }
  }

  // Buscar usuários quando o termo de busca mudar
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    // Debounce da busca
    const timeoutId = setTimeout(() => {
      loadAvailableUsers(value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  // Usuários já filtrados pela API
  const filteredUsers = availableUsers

  // Buscar membros atuais do projeto
  const currentMembers = currentProject.members?.map(member => ({
    id: member.userId,
    name: member.user?.name || 'Usuário',
    email: member.user?.email || '',
    avatar: member.user?.avatar,
    roles: member.roles || [],
    isMember: true,
    isLeader: currentProject.leaderId === member.userId
  })) || []

  const handleAddVolunteer = async () => {
    if (!selectedUser) return

    setLoading(true)
    try {
      // TODO: Implementar chamada para API
      console.log("Adicionando voluntário:", {
        userId: selectedUser.id,
        projectId,
        role: selectedRole
      })
      
      // Simular sucesso
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onVolunteerAdded?.(selectedUser.id)
      setIsAddDialogOpen(false)
      setSelectedUser(null)
      setSearchTerm("")
    } catch (error) {
      console.error("Erro ao adicionar voluntário:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveVolunteer = async (userId: number) => {
    setLoading(true)
    try {
      // TODO: Implementar chamada para API
      console.log("Removendo voluntário:", { userId, projectId })
      
      // Simular sucesso
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onVolunteerRemoved?.(userId)
    } catch (error) {
      console.error("Erro ao remover voluntário:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Botões de Ação */}
      <div className="flex items-center gap-2">
        <Dialog open={isAddDialogOpen} onOpenChange={handleAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Adicionar Voluntário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Voluntário</DialogTitle>
              <DialogDescription>
                Selecione um usuário para adicionar ao projeto
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista de Usuários */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p>Buscando usuários...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>Nenhum usuário encontrado</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUser?.id === user.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex gap-1 mt-1">
                          {user.roles.map(role => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedUser?.id === user.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Seleção de Role */}
              {selectedUser && (
                <div className="space-y-2">
                  <Label htmlFor="role">Função no Projeto</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                      <SelectItem value="PESQUISADOR">Pesquisador</SelectItem>
                      <SelectItem value="GERENTE_PROJETO">Gerente de Projeto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddVolunteer} 
                disabled={!selectedUser || loading}
              >
                {loading ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <UserMinus className="h-4 w-4" />
              Remover Voluntário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Remover Voluntário</DialogTitle>
              <DialogDescription>
                Selecione um membro para remover do projeto
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2">
              {currentMembers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhum membro no projeto</p>
                </div>
              ) : (
                currentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {member.isLeader && (
                          <Badge variant="default" className="text-xs mt-1">
                            Líder do Projeto
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveVolunteer(member.id)}
                      disabled={loading || member.isLeader}
                    >
                      {loading ? "Removendo..." : "Remover"}
                    </Button>
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Membros Atuais */}
      <div className="space-y-2">
        <h3 className="font-medium">Membros do Projeto</h3>
        {currentMembers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Nenhum membro adicionado ao projeto</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.isLeader && (
                      <Badge variant="default" className="text-xs mt-1">
                        Líder do Projeto
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {member.roles[0]}
                  </Badge>
                  {!member.isLeader && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVolunteer(member.id)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
