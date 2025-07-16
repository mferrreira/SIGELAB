import { NextResponse } from "next/server"
import { VolunteerController } from "@/backend/controllers/VolunteerController"
import { prisma } from "@/lib/prisma"

const volunteerController = new VolunteerController();

// GET: Obter uma tarefa específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const task = await prisma.tasks.findUnique({
      where: { id },
      include: { assignee: true, projectObj: true },
    })
    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ task })
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error)
    return NextResponse.json({ error: "Erro ao buscar tarefa" }, { status: 500 })
  }
}

// PUT: Atualizar uma tarefa
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    let body = await request.json()

    // Remove invalid fields for Prisma update
    const allowedFields = [
      "title", "description", "status", "priority", "assignedTo", "projectId", "dueDate", "points", "completed", "taskVisibility"
    ];
    const data: any = {}
    for (const key of allowedFields) {
      if (body[key] !== undefined) data[key] = body[key]
    }

    // Use Prisma directly for now
    const task = await prisma.tasks.update({
      where: { id },
      data,
    })
    return NextResponse.json({ task })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao atualizar tarefa:", error)
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 })
  }
}

// DELETE: Excluir uma tarefa
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    await prisma.tasks.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao excluir tarefa:", error)
    return NextResponse.json({ error: "Erro ao excluir tarefa" }, { status: 500 })
  }
}

// PATCH: Marcar tarefa como concluída e adicionar pontos ao voluntário
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id)
    const body = await request.json()
    const userId = body.userId

    // Find the task
    const task = await prisma.tasks.findUnique({ where: { id } })
    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    if (task.completed) {
      return NextResponse.json({ task }) // Already completed
    }

    // Mark as completed
    const updatedTask = await prisma.tasks.update({
      where: { id },
      data: { status: "done", completed: true },
    })

    // Add points to the user who completed the task (userId from request)
    if (userId && task.points && task.points > 0) {
      await prisma.users.update({
        where: { id: userId },
        data: {
          points: { increment: task.points },
          completedTasks: { increment: 1 },
        },
      })
    }

    return NextResponse.json({ task: { ...updatedTask, completed: true, status: "done" } })
  } catch (error) {
    console.error("Erro ao completar tarefa:", error)
    return NextResponse.json({ error: "Erro ao completar tarefa" }, { status: 500 })
  }
}
