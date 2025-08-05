import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/database/prisma"
import { createApiResponse, createApiError } from "@/lib/utils/utils"

// POST: Gerar relatório semanal baseado nos logs diários
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return createApiError("Não autenticado", 401)
    }
    
    const body = await request.json()
    const { userId, weekStart, weekEnd } = body
    
    if (!userId || !weekStart || !weekEnd) {
      return createApiError("userId, weekStart e weekEnd são obrigatórios", 400)
    }
    
    const user = session.user as any
    if (!user.roles.includes('COORDENADOR') && !user.roles.includes('GERENTE') && user.id !== userId) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }
    
    const userData = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { name: true }
    })
    
    if (!userData) {
      return createApiError("Usuário não encontrado", 404)
    }
    
    const weekStartDate = new Date(weekStart)
    weekStartDate.setHours(0, 0, 0, 0)
    const weekEndDate = new Date(weekEnd)
    weekEndDate.setHours(23, 59, 59, 999)

    const dailyLogs = await prisma.daily_logs.findMany({
      where: {
        userId: Number(userId),
        date: {
          gte: weekStartDate,
          lte: weekEndDate
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
    
    const totalLogs = dailyLogs.length
    
    let summary = ""
    if (totalLogs > 0) {
      const projects = [...new Set(dailyLogs.map(log => log.project?.name).filter(Boolean))]
      const daysWithLogs = [...new Set(dailyLogs.map(log => log.date.toISOString().split('T')[0]))]
      
      summary = `Relatório semanal: ${totalLogs} logs em ${daysWithLogs.length} dias diferentes.`
      if (projects.length > 0) {
        summary += ` Projetos envolvidos: ${projects.join(', ')}.`
      }
    } else {
      summary = "Nenhum log encontrado para este período."
    }
    
    const existingReport = await prisma.weekly_reports.findFirst({
      where: {
        userId: Number(userId),
        weekStart: weekStartDate,
        weekEnd: weekEndDate
      }
    })
    
    let weeklyReport
    if (existingReport) {

      weeklyReport = await prisma.weekly_reports.update({
        where: { id: existingReport.id },
        data: {
          totalLogs,
          summary,
        },
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
    } else {

      weeklyReport = await prisma.weekly_reports.create({
        data: {
          userId: Number(userId),
          userName: userData.name,
          weekStart: weekStartDate,
          weekEnd: weekEndDate,
          totalLogs,
          summary,
        },
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
    }
    
    const reportWithLogs = {
      ...weeklyReport,
      logs: dailyLogs
    }
    
    return createApiResponse({ weeklyReport: reportWithLogs })
  } catch (error: any) {
    console.error("Erro ao gerar relatório semanal:", error)
    
    if (error.message.includes("obrigatório") || error.message.includes("inválido")) {
      return createApiError(error.message, 400)
    }
    
    return createApiError("Erro ao gerar relatório semanal")
  }
} 