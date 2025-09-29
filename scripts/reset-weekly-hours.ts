import { prisma } from '../lib/database/prisma'
import { startOfWeek, endOfWeek, format } from 'date-fns'

async function resetWeeklyHours() {
  try {
    
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

    const now = new Date()
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 })

    const results = []

    for (const user of users) {
      if (user.weekHours > 0) {
        
        await prisma.weekly_hours_history.create({
          data: {
            userId: user.id,
            userName: user.name,
            weekStart: currentWeekStart,
            weekEnd: currentWeekEnd,
            totalHours: user.weekHours / 3600
          }
        })

        await prisma.users.update({
          where: { id: user.id },
          data: { weekHours: 0 }
        })

        const savedHours = user.weekHours / 3600
        results.push({
          userId: user.id,
          userName: user.name,
          savedHours: savedHours.toFixed(1),
          weekStart: format(currentWeekStart, 'dd/MM/yyyy'),
          weekEnd: format(currentWeekEnd, 'dd/MM/yyyy')
        })

      } else {
      }
    }

    console.log('\n=== RESUMO DO RESET ===')
    console.log(`Data/Hora: ${format(now, 'dd/MM/yyyy HH:mm:ss')}`)
    console.log(`Semana: ${format(currentWeekStart, 'dd/MM/yyyy')} a ${format(currentWeekEnd, 'dd/MM/yyyy')}`)
    console.log(`Usuários processados: ${results.length}`)
    console.log(`Total de horas salvas: ${results.reduce((sum, r) => sum + parseFloat(r.savedHours), 0).toFixed(1)}h`)
    
    if (results.length > 0) {
      console.log('\nUsuários com horas resetadas:')
      results.forEach(r => {
        console.log(`  - ${r.userName}: ${r.savedHours}h`)
      })
    }

    console.log('\nReset das horas semanais concluído com sucesso!')
  } catch (error) {
    console.error('Erro ao resetar horas semanais:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetWeeklyHours()
  .then(() => {
    console.log('Script executado com sucesso')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro na execução do script:', error)
    process.exit(1)
  }) 