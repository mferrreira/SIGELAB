import { prisma } from '../lib/prisma'

async function setRandomWeekHours() {
  try {
    const users = await prisma.users.findMany({
      where: { status: 'active' },
      select: { id: true, name: true }
    })
    if (users.length === 0) {
      return
    }
    for (const user of users) {
      // Gera um valor aleatório entre 4 e 20 horas
      const hours = Math.floor(Math.random() * (20 - 4 + 1) + 4)
      await prisma.users.update({
        where: { id: user.id },
        data: { weekHours: hours }
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar weekHours:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setRandomWeekHours() 