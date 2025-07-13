import { NextResponse } from "next/server"
import { ScheduleService } from "@/lib/services/schedule-service"
import { handlePrismaError, createApiResponse, createApiError } from "@/lib/utils"

// GET: Obter todos os horários ou filtrar por usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const schedules = await ScheduleService.getUserSchedules(
      userId ? parseInt(userId) : undefined
    )

    return createApiResponse({ schedules })
  } catch (error) {
    console.error("Erro ao buscar horários:", error)
    return createApiError("Erro ao buscar horários")
  }
}

// POST: Criar um novo horário
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, dayOfWeek, startTime, endTime } = body

    const schedule = await ScheduleService.createSchedule({
      userId: parseInt(userId),
      dayOfWeek: parseInt(dayOfWeek),
      startTime,
      endTime,
    })

    return createApiResponse({ schedule }, 201)
  } catch (error: any) {
    console.error("Erro ao criar horário:", error)
    
    // Handle validation errors
    if (error.message.includes("obrigatório") || error.message.includes("inválido")) {
      return createApiError(error.message, 400)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao criar horário")
  }
} 