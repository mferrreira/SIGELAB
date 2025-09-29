"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { UsersAPI } from "@/contexts/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/contexts/use-toast"
import { UserCheck, UserX, Clock, Users, Settings } from "lucide-react"
import { hasAccess } from "@/lib/utils/utils"
import { UserApprovalDialog } from "./user-approval-dialog"

interface PendingUser {
  id: number
  name: string
  email: string
  roles: string[]
  weekHours: number
  createdAt: string
}

export function UserApproval() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)

  // Check if user can approve others using standardized access control
  const canApprove = hasAccess(user?.roles || [], 'MANAGE_USERS')

  useEffect(() => {
    if (canApprove) {
      fetchPendingUsers()
    }
  }, [canApprove])

  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      const { pendingUsers } = await UsersAPI.getPendingUsers()
      setPendingUsers(pendingUsers)
    } catch (error) {
      console.error("Erro ao buscar usuários pendentes:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários pendentes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: number) => {
    try {
      setProcessing(userId)
      await UsersAPI.approveUser(userId)
      
      toast({
        title: "Usuário Aprovado",
        description: "O usuário foi aprovado com sucesso e já pode fazer login",
        variant: "default",
      })
      
      // Remove from pending list
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
    } catch (error) {
      console.error("Erro ao aprovar usuário:", error)
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o usuário",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (userId: number) => {
    try {
      setProcessing(userId)
      await UsersAPI.rejectPendingUser(userId)
      
      toast({
        title: "Usuário Rejeitado",
        description: "O usuário foi rejeitado",
        variant: "default",
      })
      
      // Remove from pending list
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
    } catch (error) {
      console.error("Erro ao rejeitar usuário:", error)
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o usuário",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const getRoleLabel = (roles: string[]) => {
    if (!roles || roles.length === 0) return "N/A"
    
    const roleLabels: { [key: string]: string } = {
      "VOLUNTARIO": "Voluntário",
      "COLABORADOR": "Colaborador", 
      "GERENTE_PROJETO": "Gerente de Projeto",
      "LABORATORISTA": "Laboratorista",
      "COORDENADOR": "Coordenador",
      "GERENTE": "Gerente"
    }
    
    return roles.map(role => roleLabels[role] || role).join(", ")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!canApprove) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p>Você não tem permissão para aprovar usuários</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aprovação de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Carregando usuários pendentes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Aprovação de Usuários
        </CardTitle>
        <CardDescription>
          {pendingUsers.length === 0 
            ? "Não há usuários aguardando aprovação"
            : `${pendingUsers.length} usuário(s) aguardando aprovação`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Todos os usuários foram processados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Horas Semanais</TableHead>
                <TableHead>Solicitado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((pendingUser) => (
                <TableRow key={pendingUser.id}>
                  <TableCell className="font-medium">{pendingUser.name}</TableCell>
                  <TableCell>{pendingUser.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleLabel(pendingUser.roles)}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{pendingUser.weekHours}</span>
                  </TableCell>
                  <TableCell>{formatDate(pendingUser.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUser(pendingUser)
                        setShowApprovalDialog(true)
                      }}
                      disabled={processing === pendingUser.id}
                      className="gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      Configurar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Dialog de Aprovação */}
      <UserApprovalDialog
        user={selectedUser}
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        onApproved={fetchPendingUsers}
      />
    </Card>
  )
} 