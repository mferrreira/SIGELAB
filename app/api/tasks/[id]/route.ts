import { NextResponse } from "next/server"
import { getTaskById, updateTask, deleteTask, completeTask } from "@/lib/db/tasks"

// GET: Obter uma tarefa específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const task = getTaskById(id)

    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ task }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error)
    return NextResponse.json({ error: "Erro ao buscar tarefa" }, { status: 500 })
  }
}

// PUT: Atualizar uma tarefa
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    const updatedTask = updateTask(id, body)

    if (!updatedTask) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ task: updatedTask }, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error)
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 })
  }
}

// PATCH: Marcar uma tarefa como concluída
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Se a ação for "complete", marcar a tarefa como concluída
    if (body.action === "complete") {
      const completedTask = completeTask(id)

      if (!completedTask) {
        return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
      }

      return NextResponse.json({ task: completedTask }, { status: 200 })
    }

    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao processar ação na tarefa:", error)
    return NextResponse.json({ error: "Erro ao processar ação na tarefa" }, { status: 500 })
  }
}

// DELETE: Excluir uma tarefa
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const success = deleteTask(id)

    if (!success) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error)
    return NextResponse.json({ error: "Erro ao excluir tarefa" }, { status: 500 })
  }
}
