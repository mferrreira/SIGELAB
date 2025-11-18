import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import { TaskService } from "@/backend/services/TaskService"
import { TaskRepository } from "@/backend/repositories/TaskRepository"
import { UserRepository } from "@/backend/repositories/UserRepository"
import { ProjectRepository } from "@/backend/repositories/ProjectRepository"

const taskService = new TaskService(
  new TaskRepository(),
  new UserRepository(),
  new ProjectRepository(),
); 

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const taskId = parseInt(params.id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "ID de tarefa inválido" }, { status: 400 })
    }

    const body = await request.json()
    const { reason } = body

    const task = await taskService.rejectTask(taskId, session.user.id, reason)
    
    return NextResponse.json({ 
      success: true, 
      message: "Tarefa rejeitada com sucesso",
      task: task.toJSON()
    }, { status: 200 })
  } catch (error) {
    console.error("Erro ao rejeitar tarefa:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Erro ao rejeitar tarefa" 
    }, { status: 500 })
  }
}


