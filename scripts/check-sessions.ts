import { prisma } from '../lib/prisma'

async function checkSessions() {
  try {
    console.log('🔍 Verificando sessões de trabalho...\n')
    
    const sessions = await prisma.work_sessions.findMany({
      where: {
        status: 'completed'
      },
      select: {
        id: true,
        userId: true,
        userName: true,
        startTime: true,
        endTime: true,
        duration: true,
        status: true
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    console.log(`📊 Total de sessões finalizadas: ${sessions.length}\n`)
    
    if (sessions.length === 0) {
      console.log('❌ Nenhuma sessão finalizada encontrada')
      return
    }

    console.log('📋 Sessões finalizadas:')
    console.log('─'.repeat(80))
    
    let totalDuration = 0
    
    sessions.forEach(session => {
      const duration = session.duration || 0
      const hours = duration / 3600
      totalDuration += duration
      
      console.log(`ID: ${session.id.toString().padStart(3)} | ${session.userName.padEnd(20)} | ${hours.toFixed(2).padStart(6)}h | ${session.startTime.toLocaleDateString('pt-BR')}`)
    })
    
    console.log('─'.repeat(80))
    console.log(`📈 Total de horas: ${(totalDuration / 3600).toFixed(2)}h`)
    
    // Verificar sessões da semana atual
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    
    const weekSessions = sessions.filter(s => 
      s.startTime >= monday && s.startTime <= sunday
    )
    
    console.log(`\n📅 Sessões da semana atual (${monday.toLocaleDateString('pt-BR')} a ${sunday.toLocaleDateString('pt-BR')}): ${weekSessions.length}`)
    
    if (weekSessions.length > 0) {
      const weekDuration = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      console.log(`📊 Total de horas da semana: ${(weekDuration / 3600).toFixed(2)}h`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar sessões:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSessions() 