import { prisma } from '../lib/prisma'

async function checkSessions() {
  try {
    
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

    
    if (sessions.length === 0) {
      return
    }

    
    let totalDuration = 0
    
    sessions.forEach(session => {
      const duration = session.duration || 0
      const hours = duration / 3600
      totalDuration += duration
      
    })
    
    
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
    
    
    if (weekSessions.length > 0) {
      const weekDuration = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar sessões:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSessions() 