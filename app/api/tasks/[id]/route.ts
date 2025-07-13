import { NextResponse } from "next/server"
import { TaskService } from "@/lib/services/task-service"
import { handlePrismaError, createApiResponse, createApiError } from "@/lib/utils"

// GET: Obter uma tarefa específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const task = await TaskService.getTask(id)
    return createApiResponse({ task })
  } catch (error: any) {
    console.error("Erro ao buscar tarefa:", error)
    
    if (error.message === "Tarefa não encontrada") {
      return createApiError(error.message, 404)
    }
    
    return createApiError("Erro ao buscar tarefa")
  }
}

// PUT: Atualizar uma tarefa
export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { params } = context
    const id = parseInt(params.id)
    const body = await request.json()

    // Prepare update data, removing fields not in the Prisma model
    const updateData: any = { ...body }
    delete updateData.assignedTo
    delete updateData.project

    // Handle assignee relation
    if (body.assignedTo) {
      updateData.assignedTo = parseInt(body.assignedTo)
    } else if (body.assignedTo === null) {
      updateData.assignedTo = null
    }

    // Handle projectObj relation
    if (body.project) {
      updateData.projectId = parseInt(body.project)
    }

    const task = await TaskService.updateTask(id, updateData)
    return createApiResponse({ task })
  } catch (error: any) {
    console.error("Erro ao atualizar tarefa:", error)
    
    // Handle validation errors
    if (error.message.includes("obrigatório") || error.message.includes("inválido") || error.message.includes("não encontrado")) {
      return createApiError(error.message, 400)
    }
    
    // Handle not found errors
    if (error.message === "Tarefa não encontrada") {
      return createApiError(error.message, 404)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao atualizar tarefa")
  }
}

// DELETE: Excluir uma tarefa
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    await TaskService.deleteTask(id)
    return createApiResponse({ success: true })
  } catch (error: any) {
    console.error("Erro ao excluir tarefa:", error)
    
    // Handle not found errors
    if (error.message === "Tarefa não encontrada") {
      return createApiError(error.message, 404)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao excluir tarefa")
  }
}
