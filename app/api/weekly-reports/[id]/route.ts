import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { createApiResponse, createApiError } from "@/lib/utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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