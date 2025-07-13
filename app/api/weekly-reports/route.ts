import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { createApiResponse, createApiError } from "@/lib/utils"

// GET: Obter relatórios semanais
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const weekStart = searchParams.get("weekStart")
    const weekEnd = searchParams.get("weekEnd")
    
    // Get user session to check role
    const session = await getServerSession(authOptions)
    const currentUser = session?.user as any
    
    const where: any = {}
    if (userId) where.userId = Number(userId)
    if (weekStart) where.weekStart = { gte: new Date(weekStart) }
    if (weekEnd) where.weekEnd = { lte: new Date(weekEnd) }
    
    // Role-based filtering
    if (currentUser) {
      if (currentUser.role === "voluntario" || currentUser.role === "gerente_projeto") {
        // Volunteers and project managers only see their own reports
        where.userId = currentUser.id
      }
      // Laboratorists and admins see all reports (no additional filtering)
    }
    
    const weeklyReports = await prisma.weekly_reports.findMany({
      where,
      orderBy: { weekStart: "desc" },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
    })
    
    return createApiResponse({ weeklyReports })
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
    
    // Only allow if user is admin/laboratorist or creating their own report
    const user = session.user as any
    if (user.role !== "administrador_laboratorio" && user.role !== "laboratorista" && user.id !== userId) {
      return createApiError("Sem permissão", 403)
    }
    
    // Get user name
    const userData = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { name: true }
    })
    
    if (!userData) {
      return createApiError("Usuário não encontrado", 404)
    }
    
    // Count total logs for this week
    const totalLogs = await prisma.daily_logs.count({
      where: {
        userId: Number(userId),
        date: {
          gte: new Date(weekStart),
          lte: new Date(weekEnd)
        }
      }
    })
    
    const weeklyReport = await prisma.weekly_reports.create({
      data: {
        userId: Number(userId),
        userName: userData.name,
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        totalLogs,
        summary: summary || null,
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
    
    return createApiResponse({ weeklyReport }, 201)
  } catch (error: any) {
    console.error("Erro ao criar relatório semanal:", error)
    
    if (error.message.includes("obrigatório") || error.message.includes("inválido")) {
      return createApiError(error.message, 400)
    }
    
    return createApiError("Erro ao criar relatório semanal")
  }
} 