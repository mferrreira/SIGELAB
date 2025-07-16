import * as cron from 'node-cron'
import { prisma } from './prisma'
import { startOfWeek, endOfWeek, format } from 'date-fns'

class CronService {
  private weeklyResetJob: cron.ScheduledTask | null = null
  private isInitialized = false

  /**
   * Inicializa o serviço de cron
   */
  init() {
    if (this.isInitialized) {
      console.log('CronService já foi inicializado')
      return
    }

    console.log('🚀 Inicializando CronService...')
    
    // Reset semanal - toda segunda-feira às 00:00
    this.weeklyResetJob = cron.schedule('0 0 * * 1', async () => {
      console.log('⏰ Executando reset semanal automático...')
      await this.executeWeeklyReset()
    }, {
      timezone: 'America/Sao_Paulo' // Fuso horário do Brasil
    })

    console.log('✅ CronService inicializado com sucesso!')
    console.log('📅 Reset semanal agendado para: Segunda-feira às 00:00 (GMT-3)')
    
    this.isInitialized = true
  }

  /**
   * Executa o reset semanal de horas
   */
  private async executeWeeklyReset() {
    try {
      console.log(`[${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}] Iniciando reset automático das horas semanais...`)
      
      // Buscar todos os usuários ativos
      const users = await prisma.users.findMany({
        where: {
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          weekHours: true
        }
      })

      console.log(`Encontrados ${users.length} usuários ativos`)

      const now = new Date()
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
      const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 })

      const results = []
      let totalHoursSaved = 0

      for (const user of users) {
        // Calcular horas trabalhadas a partir das sessões
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

        if (totalHours > 0) {
          console.log(`Processando usuário: ${user.name} - ${totalHours.toFixed(2)}h trabalhadas`)
          
          // Salvar no histórico
          await prisma.weekly_hours_history.create({
            data: {
              userId: user.id,
              userName: user.name,
              weekStart: currentWeekStart,
              weekEnd: currentWeekEnd,
              totalHours: totalHours
            }
          })

          const savedHours = totalHours
          totalHoursSaved += savedHours
          results.push({
            userId: user.id,
            userName: user.name,
            savedHours: savedHours.toFixed(1),
            weekStart: format(currentWeekStart, 'dd/MM/yyyy'),
            weekEnd: format(currentWeekEnd, 'dd/MM/yyyy')
          })

          console.log(`✓ ${user.name}: ${savedHours.toFixed(1)}h salvas`)
        } else {
          console.log(`- ${user.name}: Sem horas para resetar`)
        }
        
        // Resetar as horas atuais da semana para 0
        await prisma.users.update({
          where: { id: user.id },
          data: { currentWeekHours: 0 }
        })
        
        console.log(`✓ ${user.name}: Horas atuais resetadas para 0`)
      }

      console.log('\n=== RESUMO DO RESET AUTOMÁTICO ===')
      console.log(`Data/Hora: ${format(now, 'dd/MM/yyyy HH:mm:ss')}`)
      console.log(`Semana: ${format(currentWeekStart, 'dd/MM/yyyy')} a ${format(currentWeekEnd, 'dd/MM/yyyy')}`)
      console.log(`Usuários processados: ${results.length}`)
      console.log(`Total de horas salvas: ${totalHoursSaved.toFixed(1)}h`)
      
      if (results.length > 0) {
        console.log('\nUsuários com horas resetadas:')
        results.forEach(r => {
          console.log(`  - ${r.userName}: ${r.savedHours}h`)
        })
      }

      console.log('\n✅ Reset automático das horas semanais concluído com sucesso!')
      
    } catch (error) {
      console.error('❌ Erro ao executar reset automático:', error)
    }
  }

  /**
   * Para o serviço de cron
   */
  stop() {
    if (this.weeklyResetJob) {
      this.weeklyResetJob.stop()
      console.log('🛑 CronService parado')
    }
    this.isInitialized = false
  }

  /**
   * Verifica se o serviço está ativo
   */
  isRunning(): boolean {
    return this.isInitialized && this.weeklyResetJob !== null
  }

  /**
   * Executa reset manual (para testes)
   */
  async executeManualReset() {
    console.log('🔧 Executando reset manual...')
    await this.executeWeeklyReset()
  }

  /**
   * Obtém informações sobre os jobs agendados
   */
  getStatus() {
    // Calcular próxima execução manualmente (segunda-feira às 00:00)
    const now = new Date()
    const nextMonday = new Date(now)
    const daysUntilMonday = (8 - now.getDay()) % 7 // 0 = domingo, 1 = segunda, etc.
    
    if (daysUntilMonday === 0) {
      // Se hoje é segunda, próxima execução é próxima segunda
      nextMonday.setDate(now.getDate() + 7)
    } else {
      // Se não é segunda, calcular até próxima segunda
      nextMonday.setDate(now.getDate() + daysUntilMonday)
    }
    
    // Definir hora para 00:00
    nextMonday.setHours(0, 0, 0, 0)

    return {
      isInitialized: this.isInitialized,
      weeklyResetRunning: this.weeklyResetJob !== null,
      weeklyResetNextRun: nextMonday.toISOString(),
      weeklyResetSchedule: '0 0 * * 1 (Segunda-feira às 00:00)'
    }
  }
}

// Instância singleton
export const cronService = new CronService() 