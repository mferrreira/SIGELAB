"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TasksAPI, UsersAPI, RewardsAPI } from "@/lib/api-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

// Este é um componente de exemplo para demonstrar como usar as APIs com o banco de dados SQLite
export function DataSyncExample() {
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tasks")
  const [isSyncing, setIsSyncing] = useState(false)

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)

      // Carregar tarefas, usuários e recompensas em paralelo
      const [tasksResponse, usersResponse, rewardsResponse] = await Promise.all([
        TasksAPI.getAll(),
        UsersAPI.getAll(),
        RewardsAPI.getAll(),
      ])

      setTasks(tasksResponse.tasks)
      setUsers(usersResponse.users)
      setRewards(rewardsResponse.rewards)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Exemplo de criação de uma nova tarefa
  const handleCreateTask = async () => {
    try {
      setIsSyncing(true)

      // Encontrar um usuário para atribuir a tarefa
      const user = users[0]

      if (!user) {
        setError("Nenhum usuário disponível para atribuir a tarefa")
        return
      }

      const newTask = {
        title: `Nova tarefa ${Date.now()}`,
        description: "Tarefa criada via API com SQLite",
        status: "todo",
        priority: "medium",
        assignedTo: user.id,
        project: "",
        points: 10,
      }

      const response = await TasksAPI.create(newTask)

      // Atualizar a lista de tarefas
      setTasks((prevTasks) => [...prevTasks, response.task])

      alert("Tarefa criada com sucesso!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tarefa")
      console.error(err)
    } finally {
      setIsSyncing(false)
    }
  }

  // Exemplo de adição de pontos a um usuário
  const handleAddPoints = async (userId: string) => {
    try {
      setIsSyncing(true)

      const pointsToAdd = 10
      const response = await UsersAPI.addPoints(userId, pointsToAdd)

      // Atualizar a lista de usuários
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? response.user : user)))

      alert(`${pointsToAdd} pontos adicionados com sucesso!`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar pontos")
      console.error(err)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do SQLite</CardTitle>
        <CardDescription>Demonstração de como os dados são persistidos no banco de dados SQLite</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando dados do SQLite...</span>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={loadData} className="mt-2">
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <Button onClick={loadData} variant="outline" disabled={isSyncing}>
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  "Atualizar dados"
                )}
              </Button>

              <Button onClick={handleCreateTask} disabled={isSyncing}>
                Criar nova tarefa
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="tasks">
                  Tarefas <Badge className="ml-2">{tasks.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="users">
                  Usuários <Badge className="ml-2">{users.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="rewards">
                  Recompensas <Badge className="ml-2">{rewards.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-4">
                <div className="border rounded-md divide-y">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-3">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge variant={task.completed ? "success" : "outline"}>{task.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span>Pontos: {task.points}</span>
                        <span>Prioridade: {task.priority}</span>
                      </div>
                    </div>
                  ))}
                  {tasks.length > 5 && (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      ... e mais {tasks.length - 5} tarefas
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <div className="border rounded-md divide-y">
                  {users.map((user) => (
                    <div key={user.id} className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{user.role}</Badge>
                            <Badge variant="secondary">{user.completedTasks} tarefas concluídas</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-600">{user.points} pontos</div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1"
                            onClick={() => handleAddPoints(user.id)}
                            disabled={isSyncing}
                          >
                            +10 pontos
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rewards" className="space-y-4">
                <div className="border rounded-md divide-y">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-600">{reward.price} pontos</div>
                          <Badge variant={reward.available ? "success" : "secondary"}>
                            {reward.available ? "Disponível" : "Indisponível"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}
