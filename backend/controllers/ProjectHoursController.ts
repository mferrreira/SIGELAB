import { ProjectHoursService } from '../services/ProjectHoursService'

export class ProjectHoursController {
  private projectHoursService: ProjectHoursService

  constructor() {
    this.projectHoursService = new ProjectHoursService()
  }

  /**
   * Obter horas de um projeto específico
   */
  async getProjectHours(projectId: number, weekStart?: string, weekEnd?: string) {
    try {
      const startDate = weekStart ? new Date(weekStart) : undefined
      const endDate = weekEnd ? new Date(weekEnd) : undefined

      const hours = await this.projectHoursService.getProjectHours(projectId, startDate, endDate)
      return hours
    } catch (error: any) {
      console.error('Erro ao buscar horas do projeto:', error)
      throw new Error(`Erro ao buscar horas do projeto: ${error.message}`)
    }
  }

  /**
   * Obter horas semanais de um projeto
   */
  async getProjectWeeklyHours(projectId: number, weekStart: string) {
    try {
      const startDate = new Date(weekStart)
      const hours = await this.projectHoursService.getProjectWeeklyHours(projectId, startDate)
      return hours
    } catch (error: any) {
      console.error('Erro ao buscar horas semanais do projeto:', error)
      throw new Error(`Erro ao buscar horas semanais do projeto: ${error.message}`)
    }
  }

  /**
   * Obter histórico de horas de um projeto
   */
  async getProjectHoursHistory(projectId: number, months: number = 4) {
    try {
      const history = await this.projectHoursService.getProjectHoursHistory(projectId, months)
      return history
    } catch (error: any) {
      console.error('Erro ao buscar histórico de horas do projeto:', error)
      throw new Error(`Erro ao buscar histórico de horas do projeto: ${error.message}`)
    }
  }

  /**
   * Obter horas dos projetos de um usuário
   */
  async getUserProjectHours(userId: number, weekStart?: string, weekEnd?: string) {
    try {
      const startDate = weekStart ? new Date(weekStart) : undefined
      const endDate = weekEnd ? new Date(weekEnd) : undefined

      const hours = await this.projectHoursService.getUserProjectHours(userId, startDate, endDate)
      return hours
    } catch (error: any) {
      console.error('Erro ao buscar horas dos projetos do usuário:', error)
      throw new Error(`Erro ao buscar horas dos projetos do usuário: ${error.message}`)
    }
  }

  /**
   * Obter estatísticas gerais dos projetos
   */
  async getProjectStats() {
    try {
      const stats = await this.projectHoursService.getProjectStats()
      return stats
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas dos projetos:', error)
      throw new Error(`Erro ao buscar estatísticas dos projetos: ${error.message}`)
    }
  }
}
