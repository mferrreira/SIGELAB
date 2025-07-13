import { NextResponse } from "next/server"
import { TaskService } from "@/lib/services/task-service"
import { handlePrismaError, createApiResponse, createApiError } from "@/lib/utils"

// GET: Obter tarefas filtradas por usuário e papel
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")
    
    const tasks = await TaskService.getTasks(
      userId ? parseInt(userId) : undefined,
      role || undefined
    )

    return createApiResponse({ tasks })
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return createApiError("Erro ao buscar tarefas")
  }
}

// POST: Criar uma nova tarefa
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, status, priority, assignedTo, projectId, dueDate, points, taskVisibility } = body

    const task = await TaskService.createTask({
      title,
      description,
      status,
      priority,
      assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
      projectId: projectId ? parseInt(projectId) : undefined,
      dueDate,
      points: parseInt(points) || 0,
      taskVisibility,
    })

    return createApiResponse({ task }, 201)
  } catch (error: any) {
    console.error("Erro ao criar tarefa:", error)
    
    // Handle validation errors
    if (error.message.includes("obrigatório") || error.message.includes("inválido") || error.message.includes("não encontrado")) {
      return createApiError(error.message, 400)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao criar tarefa")
  }
}
