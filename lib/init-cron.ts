import { cronService } from './cron-service'

/**
 * Inicializa o serviço de cron quando o servidor Next.js inicia
 * Este arquivo deve ser importado no início da aplicação
 */
export function initCronService() {
  try {
    cronService.init()
    console.log('✅ Serviço de cron inicializado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao inicializar serviço de cron:', error)
  }
}

/**
 * Para o serviço de cron quando o servidor é encerrado
 */
export function stopCronService() {
  try {
    cronService.stop()
    console.log('🛑 Serviço de cron parado')
  } catch (error) {
    console.error('❌ Erro ao parar serviço de cron:', error)
  }
}

// Inicializar automaticamente quando este módulo for importado
if (typeof window === 'undefined') { // Só no servidor
  initCronService()
  
  // Parar o serviço quando o processo for encerrado
  process.on('SIGINT', () => {
    stopCronService()
    process.exit(0)
  })
  
  process.on('SIGTERM', () => {
    stopCronService()
    process.exit(0)
  })
} 