import { NextResponse } from "next/server"
import { TaskController } from "@/backend/controllers/TaskController"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/server-auth"

const taskController = new TaskController();

// GET: Obter uma tarefa específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const task = await taskController.getTask(id)
    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ task: task.toJSON() })
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error)
    return NextResponse.json({ error: "Erro ao buscar tarefa" }, { status: 500 })
  }
}

// PUT: Atualizar uma tarefa
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()

    // Remove invalid fields for update
    const allowedFields = [
      "title", "description", "status", "priority", "assignedTo", "projectId", "dueDate", "points", "completed", "taskVisibility"
    ];
    const data: any = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) data[key] = body[key]
    }

    const task = await taskController.updateTask(id, data, parseInt(session.user.id))
    return NextResponse.json({ task: task.toJSON() })
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao atualizar tarefa:", error)
    return NextResponse.json({ error: error.message || "Erro ao atualizar tarefa" }, { status: 500 })
  }
}

// DELETE: Excluir uma tarefa
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params
    const id = parseInt(params.id)
    await taskController.deleteTask(id, parseInt(session.user.id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao excluir tarefa:", error)
    return NextResponse.json({ error: error.message || "Erro ao excluir tarefa" }, { status: 500 })
  }
}

// PATCH: Marcar tarefa como concluída e adicionar pontos ao voluntário
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id)
    const body = await request.json()
    const { action, userId } = body

    // Only process completion requests
    if (action !== "complete") {
      return NextResponse.json({ error: "Ação inválida. Use 'complete' para marcar tarefa como concluída." }, { status: 400 })
    }

    // Use the userId from request body or fallback to session user
    const userToAward = userId ? parseInt(userId) : parseInt(session.user.id);
    
    const task = await taskController.completeTask(id, userToAward)
    
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
