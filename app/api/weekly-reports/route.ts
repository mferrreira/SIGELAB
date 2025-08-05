import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createApiResponse, createApiError } from "@/lib/utils/utils"
import { WeeklyReportController } from "@/backend/controllers/WeeklyReportController"

const weeklyReportController = new WeeklyReportController();

// GET: Obter relatórios semanais
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const weekStart = searchParams.get("weekStart")
    const weekEnd = searchParams.get("weekEnd")
    const session = await getServerSession(authOptions)
    const currentUser = session?.user as any

    let reports = await weeklyReportController.getAllReports();

    if (userId) reports = reports.filter((r: any) => r.userId === Number(userId));
    if (weekStart) reports = reports.filter((r: any) => new Date(r.weekStart) >= new Date(weekStart));
    if (weekEnd) reports = reports.filter((r: any) => new Date(r.weekEnd) <= new Date(weekEnd));
    return createApiResponse({ weeklyReports: reports })
  } catch (error) {
    console.error("Erro ao buscar relatórios semanais:", error)
    return createApiError("Erro ao buscar relatórios semanais")
  }
}

// POST: Criar um novo relatório semanal
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return createApiError("Não autenticado", 401)
    }
    const body = await request.json()
    const { userId, weekStart, weekEnd, summary } = body
    if (!userId || !weekStart || !weekEnd) {
      return createApiError("userId, weekStart e weekEnd são obrigatórios", 400)
    }
    const user = session.user as any
    if (user.role !== "administrador_laboratorio" && user.role !== "laboratorista" && user.id !== userId) {
      return createApiError("Sem permissão", 403)
    }
    
    const weeklyReport = await weeklyReportController.createReport({
      userId: Number(userId),
      userName: user.name,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      summary: summary || null,
    });
    return createApiResponse({ weeklyReport }, 201)
  } catch (error: any) {
    console.error("Erro ao criar relatório semanal:", error)
    if (error.message.includes("obrigatório") || error.message.includes("inválido")) {
      return createApiError(error.message, 400)
    }
    return createApiError("Erro ao criar relatório semanal")
  }
} 