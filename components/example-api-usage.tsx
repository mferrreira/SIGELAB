"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TasksAPI, UsersAPI } from "@/lib/api-client"

// Este é um componente de exemplo para demonstrar como usar as APIs
export function ExampleApiUsage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados ao montar o componente
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Carregar tarefas e usuários em paralelo
        const [tasksResponse, usersResponse] = await Promise.all([TasksAPI.getAll(), UsersAPI.getAll()])

        setTasks(tasksResponse.tasks)
        setUsers(usersResponse.users)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Exemplo de criação de uma nova tarefa
  const handleCreateTask = async () => {
    try {
      // Encontrar um usuário para atribuir a tarefa
      const user = users[0]

      if (!user) {
        setError("Nenhum usuário disponível para atribuir a tarefa")
        return
      }

      const newTask = {
        title: `Nova tarefa ${Date.now()}`,
        description: "Tarefa criada via API",
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
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemplo de Uso da API</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando dados...</p>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="font-medium mb-2">Tarefas ({tasks.length})</h3>
              <ul className="list-disc pl-5">
                {tasks.slice(0, 5).map((task) => (
                  <li key={task.id}>{task.title}</li>
                ))}
                {tasks.length > 5 && <li>... e mais {tasks.length - 5} tarefas</li>}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">Usuários ({users.length})</h3>
              <ul className="list-disc pl-5">
                {users.map((user) => (
                  <li key={user.id}>
                    {user.name} ({user.points} pontos)
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={handleCreateTask}>Criar Nova Tarefa</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
