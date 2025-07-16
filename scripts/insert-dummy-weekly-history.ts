import { prisma } from '../lib/prisma'
import { startOfWeek, subWeeks, endOfWeek } from 'date-fns'

async function insertDummyWeeklyHistory() {
  try {
    console.log('Inserindo dados dummy de histórico semanal...')
    
    // Obter todos os usuários aprovados
    const users = await prisma.users.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true
      }
    })

    console.log(`Encontrados ${users.length} usuários para inserir dados dummy`)

    // Gerar dados para as últimas 12 semanas
    for (let weekOffset = 1; weekOffset <= 12; weekOffset++) {
      const weekStart = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 })

      for (const user of users) {
        // Gerar horas aleatórias entre 5 e 45 horas por semana
        const randomHours = Math.random() * 40 + 5
        
        await prisma.weekly_hours_history.create({
          data: {
            userId: user.id,
            userName: user.name,
            weekStart: weekStart,
            weekEnd: weekEnd,
            totalHours: parseFloat(randomHours.toFixed(1))
          }
        })

        console.log(`Dados inseridos para ${user.name} - Semana ${weekOffset}: ${randomHours.toFixed(1)}h`)
      }
    }

    console.log('Dados dummy inseridos com sucesso!')
  } catch (error) {
    console.error('Erro ao inserir dados dummy:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
insertDummyWeeklyHistory()
  .then(() => {
    console.log('Script executado com sucesso')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Erro na execução do script:', error)
    process.exit(1)
  }) 