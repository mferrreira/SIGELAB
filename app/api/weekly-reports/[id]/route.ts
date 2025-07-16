import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { createApiResponse, createApiError } from "@/contexts/utils"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return createApiError("Não autenticado", 401)
    }
    const id = parseInt(params.id)
    if (!id) {
      return createApiError("ID inválido", 400)
    }
    // Fetch the weekly report
    const report = await prisma.weekly_reports.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
    if (!report) {
      return createApiError("Relatório não encontrado", 404)
    }
    // Fetch all daily logs for the report's user and week
    const dailyLogs = await prisma.daily_logs.findMany({
      where: {
        userId: report.userId,
        date: {
          gte: report.weekStart,
          lte: report.weekEnd
        }
      },
      orderBy: { date: "asc" },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    return createApiResponse({
      weeklyReport: {
        ...report,
        logs: dailyLogs
      }
    })
  } catch (error) {
    console.error("Erro ao buscar relatório semanal:", error)
    return createApiError("Erro interno do servidor", 500)
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return createApiError("Não autenticado", 401)
    }
    const id = parseInt(params.id)
    if (!id) {
      return createApiError("ID inválido", 400)
    }
    // Fetch the report to check permissions
    const report = await prisma.weekly_reports.findUnique({ where: { id } })
    if (!report) {
      return createApiError("Relatório não encontrado", 404)
    }
    const user = session.user as any
    if (user.role !== "administrador_laboratorio" && user.id !== report.userId) {
      return createApiError("Sem permissão", 403)
    }
    await prisma.weekly_reports.delete({ where: { id } })
    return createApiResponse({ success: true })
  } catch (error) {
    console.error("Erro ao deletar relatório semanal:", error)
    return createApiError("Erro ao deletar relatório semanal", 500)
  }
} 