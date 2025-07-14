import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { createApiResponse, createApiError } from "@/contexts/utils"

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
    
    // Only allow if user is admin/laboratorist or generating their own report
    const user = session.user as any
    if (user.role !== "administrador_laboratorio" && user.role !== "laboratorist" && user.id !== userId) {
      return createApiError("Sem permissão", 403)
    }
    
    // Get user data
    const userData = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { name: true }
    })
    
    if (!userData) {
      return createApiError("Usuário não encontrado", 404)
    }
    
    // Get all daily logs for the user in the date range
    const dailyLogs = await prisma.daily_logs.findMany({
      where: {
        userId: Number(userId),
        date: {
          gte: new Date(weekStart),
          lte: new Date(weekEnd)
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
    
    // Count total logs
    const totalLogs = dailyLogs.length
    
    // Generate summary based on logs
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
    
    // Check if a weekly report already exists for this user and week
    const existingReport = await prisma.weekly_reports.findFirst({
      where: {
        userId: Number(userId),
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd)
      }
    })
    
    let weeklyReport
    if (existingReport) {
      // Update existing report
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
              role: true
            }
          }
        }
      })
    } else {
      // Create new report
      weeklyReport = await prisma.weekly_reports.create({
        data: {
          userId: Number(userId),
          userName: userData.name,
          weekStart: new Date(weekStart),
          weekEnd: new Date(weekEnd),
          totalLogs,
          summary,
        },
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
    }
    
    // Add the daily logs to the response
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