import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter todas as tarefas
export async function GET() {
  try {
    const tasks = await prisma.tasks.findMany({
      include: {
        assignee: true,
        projectObj: true,
      },
    })
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
    if (!body.title) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }
    
    const task = await prisma.tasks.create({
      data: {
        title: body.title,
        description: body.description || "",
        status: body.status || "todo",
        priority: body.priority || "medium",
        assignedTo: body.assignedTo ? parseInt(body.assignedTo) : null,
        projectId: body.project ? parseInt(body.project) : null,
        dueDate: body.dueDate || "",
        points: body.points || 0,
        completed: false,
      },
      include: {
        assignee: true,
        projectObj: true,
      },
    })
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar tarefa:", error)
    return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 })
  }
}
