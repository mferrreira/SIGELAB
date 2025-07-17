import { prisma } from '../lib/prisma'

async function checkUserHours() {
  try {
    
    const users = await prisma.users.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        weekHours: true
      },
      orderBy: {
        weekHours: 'desc'
      }
    })

    
    if (users.length === 0) {
      return
    }

    
    let totalHours = 0
    let usersWithHours = 0
    
    users.forEach(user => {
      const hours = user.weekHours
      totalHours += hours
      
      if (user.weekHours > 0) {
        usersWithHours++
      }
      
    })
    
    
    if (usersWithHours === 0) {
      return
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar horas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserHours() 