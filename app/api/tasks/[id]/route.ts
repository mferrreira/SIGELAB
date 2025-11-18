import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/server-auth"
import { TaskService } from "@/backend/services/TaskService"
import { TaskRepository } from "@/backend/repositories/TaskRepository"
import { UserRepository } from "@/backend/repositories/UserRepository"
import { ProjectRepository } from "@/backend/repositories/ProjectRepository"

const taskService = new TaskService(
  new TaskRepository(),
  new UserRepository(),
  new ProjectRepository(),
);

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const task = await taskService.findById(id)
    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ task: task.toJSON() })
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error)
    return NextResponse.json({ error: "Erro ao buscar tarefa" }, { status: 500 })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()

    const allowedFields = [
      "title", "description", "status", "priority", "assignedTo", "projectId", "dueDate", "points", "completed", "taskVisibility", "isGlobal"
    ];
    const data: any = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) data[key] = body[key]
    }

    const task = await taskService.update(id, data, parseInt((session.user as any).id))
    return NextResponse.json({ task: task.toJSON() })
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao atualizar tarefa:", error)
    return NextResponse.json({ error: error.message || "Erro ao atualizar tarefa" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params
    const id = parseInt(params.id)
    await taskService.delete(id, parseInt((session.user as any).id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao excluir tarefa:", error)
    return NextResponse.json({ error: error.message || "Erro ao excluir tarefa" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id)
    const body = await request.json()
    const { action, userId } = body

    if (action !== "complete") {
      return NextResponse.json({ error: "Ação inválida. Use 'complete' para marcar tarefa como concluída." }, { status: 400 })
    }

    const userToAward = userId ? parseInt(userId) : parseInt((session.user as any).id);
    
    const task = await taskService.completeTask(id, userToAward)
    
    console.log(`✅ Task ${id} completed by user ${userToAward}. Awarded ${task.points} points.`)
    
    return NextResponse.json({ task: task.toJSON() })
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao completar tarefa:", error)
    return NextResponse.json({ error: error.message || "Erro ao completar tarefa" }, { status: 500 })
  }
}
