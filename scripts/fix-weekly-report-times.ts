import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function normalizeWeeklyReportTimes() {
  const reports = await prisma.weekly_reports.findMany()
  for (const report of reports) {
    const weekStart = new Date(report.weekStart)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(report.weekEnd)
    weekEnd.setHours(23, 59, 59, 999)
    await prisma.weekly_reports.update({
      where: { id: report.id },
      data: {
        weekStart,
        weekEnd,
      },
    })
    console.log(`Updated report ${report.id}: weekStart=${weekStart}, weekEnd=${weekEnd}`)
  }
}

async function addDummyReports() {
  await prisma.weekly_reports.create({
    data: {
      userId: 1,
      userName: 'Gerente',
      weekStart: new Date('2025-07-06T00:00:00'),
      weekEnd: new Date('2025-07-12T23:59:59'),
      totalLogs: 5,
      summary: 'Dummy report for testing',
    },
  })
  await prisma.weekly_reports.create({
    data: {
      userId: 3,
      userName: 'Laboratorista',
      weekStart: new Date('2025-07-13T00:00:00'),
      weekEnd: new Date('2025-07-19T23:59:59'),
      totalLogs: 7,
      summary: 'Another dummy report for testing',
    },
  })
  console.log('Dummy reports added.')
}

async function main() {
  await normalizeWeeklyReportTimes()
  await addDummyReports()
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
}) 