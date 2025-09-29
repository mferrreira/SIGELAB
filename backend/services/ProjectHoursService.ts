import { prisma } from '@/lib/database/prisma'
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns'

export class ProjectHoursService {
  /**
   * Calcula as horas trabalhadas em um projeto específico
   */
  async getProjectHours(projectId: number, weekStart?: Date, weekEnd?: Date) {
    try {
      const whereClause: any = {
        projectId: projectId,
        status: 'completed'
      }

      if (weekStart && weekEnd) {
        whereClause.startTime = {
          gte: weekStart,
          lte: weekEnd
        }
      }

      const sessions = await prisma.work_sessions.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        }
      })

      const totalHours = sessions.reduce((sum, session) => {
        return sum + (session.duration || 0)
      }, 0)

      const hoursByUser = sessions.reduce((acc, session) => {
        const userId = session.userId
        if (!acc[userId]) {
          acc[userId] = {
            userId: session.userId,
            userName: session.userName,
            totalHours: 0,
            sessions: []
          }
        }
        acc[userId].totalHours += session.duration || 0
        acc[userId].sessions.push(session)
        return acc
      }, {} as any)

      return {
        projectId,
        totalHours,
        sessionCount: sessions.length,
        hoursByUser: Object.values(hoursByUser),
        sessions: sessions.map(session => ({
          id: session.id,
          userId: session.userId,
          userName: session.userName,
          startTime: session.startTime,
          endTime: session.endTime,
          duration: session.duration,
          activity: session.activity,
          location: session.location
        }))
      }
    } catch (error) {
      console.error('Erro ao calcular horas do projeto:', error)
      throw new Error('Erro ao calcular horas do projeto')
    }
  }

  /**
   * Calcula as horas semanais de um projeto
   */
  async getProjectWeeklyHours(projectId: number, weekStart: Date) {
    try {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      
      return await this.getProjectHours(projectId, weekStart, weekEnd)
    } catch (error) {
      console.error('Erro ao calcular horas semanais do projeto:', error)
      throw new Error('Erro ao calcular horas semanais do projeto')
    }
  }

  /**
   * Calcula as horas dos últimos N meses de um projeto
   */
  async getProjectHoursHistory(projectId: number, months: number = 4) {
    try {
      const now = new Date()
      const weeks = []

      for (let i = 0; i < months * 4; i++) {
        const weekStart = subWeeks(now, i)
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
        
        const weekData = await this.getProjectWeeklyHours(projectId, weekStart)
        
        weeks.push({
          weekStart: format(weekStart, 'dd/MM/yyyy'),
          weekEnd: format(weekEnd, 'dd/MM/yyyy'),
          totalHours: weekData.totalHours,
          sessionCount: weekData.sessionCount,
          hoursByUser: weekData.hoursByUser
        })
      }

      return {
        projectId,
        weeks,
        totalHours: weeks.reduce((sum, week) => sum + week.totalHours, 0),
        averageHoursPerWeek: weeks.length > 0 ? weeks.reduce((sum, week) => sum + week.totalHours, 0) / weeks.length : 0
      }
    } catch (error) {
      console.error('Erro ao calcular histórico de horas do projeto:', error)
      throw new Error('Erro ao calcular histórico de horas do projeto')
    }
  }

  /**
   * Calcula horas de todos os projetos de um usuário
   */
  async getUserProjectHours(userId: number, weekStart?: Date, weekEnd?: Date) {
    try {
      // Buscar projetos do usuário
      const userProjects = await prisma.project_members.findMany({
        where: { userId },
        include: {
          project: true
        }
      })

      const projectsWithHours = []

      for (const membership of userProjects) {
        const projectHours = await this.getProjectHours(membership.project.id, weekStart, weekEnd)
        
        // Filtrar apenas as horas deste usuário
        const userHours = projectHours.hoursByUser.find((h: any) => h.userId === userId)
        
        projectsWithHours.push({
          projectId: membership.project.id,
          projectName: membership.project.name,
          projectStatus: membership.project.status,
          userHours: userHours?.totalHours || 0,
          projectTotalHours: projectHours.totalHours,
          sessionCount: userHours?.sessions?.length || 0,
          userSessions: userHours?.sessions || []
        })
      }

      return projectsWithHours
    } catch (error) {
      console.error('Erro ao calcular horas dos projetos do usuário:', error)
      throw new Error('Erro ao calcular horas dos projetos do usuário')
    }
  }

  /**
   * Calcula estatísticas gerais de horas por projeto
   */
  async getProjectStats() {
    try {
      const projects = await prisma.projects.findMany({
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })

      const projectsWithStats = []

      for (const project of projects) {
        const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
        const projectHours = await this.getProjectWeeklyHours(project.id, currentWeekStart)
        
        projectsWithStats.push({
          projectId: project.id,
          projectName: project.name,
          projectStatus: project.status,
          memberCount: project.members.length,
          currentWeekHours: projectHours.totalHours,
          currentWeekSessions: projectHours.sessionCount,
          members: project.members.map(member => ({
            userId: member.userId,
            userName: member.user.name,
            roles: member.roles
          }))
        })
      }

      return projectsWithStats
    } catch (error) {
      console.error('Erro ao calcular estatísticas dos projetos:', error)
      throw new Error('Erro ao calcular estatísticas dos projetos')
    }
  }
}
