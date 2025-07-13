import { NextResponse } from "next/server"
import { ScheduleService } from "@/lib/services/schedule-service"
import { handlePrismaError, createApiResponse, createApiError } from "@/lib/utils"

// GET: Obter um horário específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return createApiError("ID inválido", 400)
    }

    const schedule = await ScheduleService.getSchedule(id)
    return createApiResponse({ schedule })
  } catch (error: any) {
    console.error("Erro ao buscar horário:", error)
    
    if (error.message === "Horário não encontrado") {
      return createApiError(error.message, 404)
    }
    
    return createApiError("Erro ao buscar horário")
  }
}

// PUT: Atualizar um horário
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return createApiError("ID inválido", 400)
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime } = body

    const schedule = await ScheduleService.updateSchedule(id, {
      dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined,
      startTime,
      endTime,
    })

    return createApiResponse({ schedule })
  } catch (error: any) {
    console.error("Erro ao atualizar horário:", error)
    
    // Handle validation errors
    if (error.message.includes("obrigatório") || error.message.includes("inválido")) {
      return createApiError(error.message, 400)
    }
    
    // Handle not found errors
    if (error.message === "Horário não encontrado") {
      return createApiError(error.message, 404)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao atualizar horário")
  }
}

// DELETE: Excluir um horário
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return createApiError("ID inválido", 400)
    }

    await ScheduleService.deleteSchedule(id)
    return createApiResponse({ success: true })
  } catch (error: any) {
    console.error("Erro ao excluir horário:", error)
    
    // Handle not found errors
    if (error.message === "Horário não encontrado") {
      return createApiError(error.message, 404)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao excluir horário")
  }
} 