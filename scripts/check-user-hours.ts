import { prisma } from '../lib/prisma'

async function checkUserHours() {
  try {
    console.log('🔍 Verificando horas dos usuários...\n')
    
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

    console.log(`📊 Total de usuários ativos: ${users.length}\n`)
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário ativo encontrado')
      return
    }

    console.log('👥 Usuários e suas horas semanais:')
    console.log('─'.repeat(80))
    
    let totalHours = 0
    let usersWithHours = 0
    
    users.forEach(user => {
      const hours = user.weekHours
      totalHours += hours
      
      if (user.weekHours > 0) {
        usersWithHours++
      }
      
      console.log(`${user.id.toString().padStart(3)} | ${user.name.padEnd(20)} | ${hours.toFixed(2).padStart(6)}h`)
    })
    
    console.log('─'.repeat(80))
    console.log(`📈 Total de horas: ${totalHours.toFixed(2)}h`)
    console.log(`👤 Usuários com horas: ${usersWithHours}/${users.length}`)
    
    if (usersWithHours === 0) {
      console.log('\n⚠️  NENHUM USUÁRIO TEM META SEMANAL DEFINIDA!')
      console.log('   Isso explica por que o reset mostra 0h.')
      console.log('   As metas semanais precisam ser definidas no campo weekHours dos usuários.')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar horas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserHours() 