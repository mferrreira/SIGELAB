import { NextResponse } from "next/server"
import { getAllTasks, createTask } from "@/lib/db/tasks"

// GET: Obter todas as tarefas
export async function GET() {
  try {
    const tasks = getAllTasks()

    return NextResponse.json({ tasks }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 })
  }
}

// POST: Criar uma nova tarefa
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar dados
    if (!body.title || !body.assignedTo) {
      return NextResponse.json({ error: "Título e responsável são obrigatórios" }, { status: 400 })
    }

    // Criar nova tarefa
    const task = createTask({
      title: body.title,
      description: body.description || "",
      status: body.status || "todo",
      priority: body.priority || "medium",
      assignedTo: body.assignedTo,
      project: body.project || "",
      dueDate: body.dueDate || "",
      points: body.points || 0,
      completed: false,
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar tarefa:", error)
    return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 })
  }
}
