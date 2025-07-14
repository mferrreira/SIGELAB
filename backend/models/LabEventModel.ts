import { prisma } from '@/lib/prisma';

export class LabEventModel {
  async findByDate(date: Date) {
    // Find all events for the given day (ignoring time)
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    return prisma.lab_events.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    })
  }

  async create(data: any) {
    return prisma.lab_events.create({ data })
  }

  async findAll() {
    return prisma.lab_events.findMany({ orderBy: { date: 'desc' } })
  }
} 