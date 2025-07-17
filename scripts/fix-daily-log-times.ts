import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getRandomTimeBetween7And22(date: Date): Date {
  const hour = Math.floor(Math.random() * (22 - 7 + 1)) + 7
  const minute = Math.floor(Math.random() * 60)
  const second = Math.floor(Math.random() * 60)
  const newDate = new Date(date)
  newDate.setHours(hour, minute, second, 0)
  return newDate
}

async function fixDailyLogTimes() {
  const logs = await prisma.daily_logs.findMany()
  let count = 0
  for (const log of logs) {
    const d = new Date(log.date)
    if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) {
      // Only update logs that are at 00:00:00 UTC
      const newDate = getRandomTimeBetween7And22(d)
      await prisma.daily_logs.update({
        where: { id: log.id },
        data: { date: newDate },
      })
      count++
    }
  }
  await prisma.$disconnect()
}

fixDailyLogTimes().catch(e => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
}) 