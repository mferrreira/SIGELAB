import { prisma } from "@/lib/database/prisma"
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns"

export class WeeklyHoursHistoryController {
  async getAllHistory() {
    try {
      const history = await prisma.weekly_hours_history.findMany({
        orderBy: {
          weekStart: 'desc'
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
      return history
    } catch (error) {
      console.error("Erro ao buscar histórico de horas semanais:", error)
      throw new Error("Erro ao buscar histórico de horas semanais")
    }
  }

  async getHistoryByWeek(weekStart: Date) {
    try {
      // Normalizar a data para comparar apenas a data (sem hora)
      const normalizedWeekStart = new Date(weekStart);
      normalizedWeekStart.setHours(0, 0, 0, 0);
      
      const history = await prisma.weekly_hours_history.findMany({
        where: {
          weekStart: {
            gte: normalizedWeekStart,
            lt: new Date(normalizedWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 dias
          }
        },
        orderBy: {
          totalHours: 'desc'
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
      return history
    } catch (error) {
      console.error("Erro ao buscar histórico por semana:", error)
      throw new Error("Erro ao buscar histórico por semana")
    }
  }

  async getHistoryByUser(userId: number, weeks: number = 12) {
    try {
      const history = await prisma.weekly_hours_history.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          weekStart: 'desc'
        },
        take: weeks
      })
      return history
    } catch (error) {
      console.error("Erro ao buscar histórico do usuário:", error)
      throw new Error("Erro ao buscar histórico do usuário")
    }
  }

  async saveWeeklyHours(userId: number, weekStart: Date, weekEnd: Date, totalHours: number) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { name: true }
      })

      if (!user) {
        throw new Error("Usuário não encontrado")
      }

      const history = await prisma.weekly_hours_history.create({
        data: {
          userId: userId,
          userName: user.name,
          weekStart: weekStart,
          weekEnd: weekEnd,
          totalHours: totalHours
        }
      })
      return history
    } catch (error) {
      console.error("Erro ao salvar horas semanais:", error)
      throw new Error("Erro ao salvar horas semanais")
    }
  }

  async resetWeeklyHours() {
    try {
      // Buscar todos os usuários ativos
      const users = await prisma.users.findMany({
        where: {
          status: 'active'
        },
        select: {
          id: true,
          name: true
        }
      })

      const now = new Date()
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
      const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 })

      const results = []

      for (const user of users) { 
        const sessions = await prisma.work_sessions.findMany({
          where: {
            userId: user.id,
            status: 'completed',
            startTime: {
              gte: currentWeekStart,
              lte: currentWeekEnd
            }
          },
          select: {
            duration: true
          }
        })
        const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
        const totalHours = totalSeconds / 3600

        await prisma.weekly_hours_history.create({
          data: {
            userId: user.id,
            userName: user.name,
            weekStart: currentWeekStart,
            weekEnd: currentWeekEnd,
            totalHours: totalHours
          }
        })

        results.push({
          userId: user.id,
          userName: user.name,
          savedHours: totalHours,
          weekStart: format(currentWeekStart, 'dd/MM/yyyy'),
          weekEnd: format(currentWeekEnd, 'dd/MM/yyyy')
        })
      }

      return results
    } catch (error) {
      console.error("Erro ao resetar horas semanais:", error)
      throw new Error("Erro ao resetar horas semanais")
    }
  }

  async getWeeklyStats() {
    try {
      const now = new Date()
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
      const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 })

      const currentWeekHistory = await this.getHistoryByWeek(currentWeekStart)
      
      const last4Weeks = []
      for (let i = 1; i <= 4; i++) {
        const weekStart = subWeeks(now, i)
        const weekHistory = await this.getHistoryByWeek(weekStart)
        last4Weeks.push({
          weekStart: format(weekStart, 'dd/MM/yyyy'),
          weekEnd: format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'dd/MM/yyyy'),
          totalHours: weekHistory.reduce((sum: number, h: any) => sum + h.totalHours, 0),
          userCount: weekHistory.length
        })
      }

      return {
        currentWeek: {
          weekStart: format(currentWeekStart, 'dd/MM/yyyy'),
          weekEnd: format(currentWeekEnd, 'dd/MM/yyyy'),
          totalHours: currentWeekHistory.reduce((sum: number, h: any) => sum + h.totalHours, 0),
          userCount: currentWeekHistory.length,
          topUsers: currentWeekHistory.slice(0, 5)
        },
        last4Weeks
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas semanais:", error)
      throw new Error("Erro ao buscar estatísticas semanais")
    }
  }
} 