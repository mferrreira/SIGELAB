#!/usr/bin/env node

import { prisma } from '../lib/prisma'
import { startOfWeek, endOfWeek, format } from 'date-fns'

async function autoResetWeeklyHours() {
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
      if (user.weekHours > 0) {
        console.log(`Processando usuário: ${user.name} - ${user.weekHours} segundos`)
        
        // Salvar as horas da semana atual no histórico
        await prisma.weekly_hours_history.create({
          data: {
            userId: user.id,
            userName: user.name,
            weekStart: currentWeekStart,
            weekEnd: currentWeekEnd,
            totalHours: user.weekHours / 3600 // Converter de segundos para horas
          }
        })

        // Resetar as horas semanais para 0
        await prisma.users.update({
          where: { id: user.id },
          data: { weekHours: 0 }
        })

        const savedHours = user.weekHours / 3600
        totalHoursSaved += savedHours
        results.push({
          userId: user.id,
          userName: user.name,
          savedHours: savedHours.toFixed(1),
          weekStart: format(currentWeekStart, 'dd/MM/yyyy'),
          weekEnd: format(currentWeekEnd, 'dd/MM/yyyy')
        })

        console.log(`✓ ${user.name}: ${savedHours.toFixed(1)}h salvas e resetadas`)
      } else {
        console.log(`- ${user.name}: Sem horas para resetar`)
      }
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

    console.log('\nReset automático das horas semanais concluído com sucesso!')
    
    // Retornar código de sucesso
    process.exit(0)
  } catch (error) {
    console.error('Erro ao resetar horas semanais:', error)
    // Retornar código de erro
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
autoResetWeeklyHours() 