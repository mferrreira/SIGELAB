import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/database/prisma"
import { createApiResponse, createApiError } from "@/lib/utils/utils"


// TODO: Tirar chamada do prisma e chamar o service
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
    const report = await prisma.weekly_reports.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true
          }
        }
      }
    })
    if (!report) {
      return createApiError("Relatório não encontrado", 404)
    }

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

    // TODO: Triar chamada do prisma e mover para o repository/service
    const report = await prisma.weekly_reports.findUnique({ where: { id } })
    if (!report) {
      return createApiError("Relatório não encontrado", 404)
    }
    const user = session.user as any
    if (!user.roles.includes('COORDENADOR') && user.id !== report.userId) {
      return createApiError("Sem permissão", 403)
    }
    await prisma.weekly_reports.delete({ where: { id } })
    return createApiResponse({ success: true })
  } catch (error) {
    console.error("Erro ao deletar relatório semanal:", error)
    return createApiError("Erro ao deletar relatório semanal", 500)
  }
} 