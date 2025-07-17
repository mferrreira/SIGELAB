import { prisma } from '@/lib/database/prisma';

export class WeeklyReportModel {
  async findById(id: number) {
    return prisma.weekly_reports.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.weekly_reports.findMany();
  }

  async create(data: any) {
    // Normalize weekStart to 00:00:00 and weekEnd to 23:59:59 local time
    if (data.weekStart) {
      const start = new Date(data.weekStart)
      start.setHours(0, 0, 0, 0)
      data.weekStart = start
    }
    if (data.weekEnd) {
      const end = new Date(data.weekEnd)
      end.setHours(23, 59, 59, 999)
      data.weekEnd = end
    }
    return prisma.weekly_reports.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.weekly_reports.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.weekly_reports.delete({ where: { id } });
  }

  async findByUserId(userId: number) {
    return prisma.weekly_reports.findMany({ where: { userId } });
  }
} 