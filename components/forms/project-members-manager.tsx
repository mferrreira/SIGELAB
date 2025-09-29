import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Trash2, UserPlus } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useAuth } from "@/contexts/auth-context"

interface ProjectMembersManagerProps {
  projectId: number
}

export function ProjectMembersManager({ projectId }: ProjectMembersManagerProps) {
  const { user } = useAuth()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addUserId, setAddUserId] = useState("")
  const [addRoles, setAddRoles] = useState<string[]>(["VOLUNTARIO"])
  const { users, loading: usersLoading } = useUser()

  const canManageMembers = user && user.roles && user.roles.some((r: string) => ["GERENTE", "GERENTE_PROJETO", "COORDENADOR"].includes(r))

  if (!canManageMembers) {
    return null
  }

  const fetchMembers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/members`)
      const data = await res.json()
      setMembers(data.members || [])
    } catch (e) {
      setError("Erro ao buscar membros do projeto")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
    // eslint-disable-next-line
  }, [projectId])

  const handleAddMember = async () => {
    if (!addUserId || !addRoles.length) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: addUserId, roles: addRoles }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao adicionar membro")
      } else {
        setAddUserId("")
        setAddRoles(["VOLUNTARIO"])
        fetchMembers()
      }
    } catch (e) {
      setError("Erro ao adicionar membro")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao remover membro")
      } else {
        fetchMembers()
      }
    } catch (e) {
      setError("Erro ao remover membro")
    } finally {
      setLoading(false)
    }
  }

  // Only show users not already in the project
  const availableUsers = users.filter(
    (u) => !members.some((m) => m.userId === u.id)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Gerenciar Membros do Projeto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="mb-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Select value={addUserId} onValueChange={setAddUserId} disabled={usersLoading || loading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um usuário para adicionar" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({Array.isArray(user.roles) ? user.roles.join(', ') : ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={addRoles[0]} onValueChange={v => setAddRoles([v])} disabled={loading}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VOLUNTARIO">Voluntário</SelectItem>
                  <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                  <SelectItem value="GERENTE_PROJETO">Gerente</SelectItem>
                  <SelectItem value="COORDENADOR">Coordenador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddMember} disabled={!addUserId || loading}>
              Adicionar
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {members.length === 0 ? (
            <div className="text-muted-foreground">Nenhum membro neste projeto.</div>
          ) : (
            members.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{member.user.name} ({member.user.email})</span>
                  {Array.isArray(member.roles)
                    ? member.roles.map((r: string) => <Badge key={r}>{r}</Badge>)
                    : <Badge>{member.role}</Badge>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.userId)}
                  disabled={loading}
                  title="Remover do projeto"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 