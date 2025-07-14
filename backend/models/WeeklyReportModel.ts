import { prisma } from '@/lib/prisma';

export class WeeklyReportModel {
  async findById(id: number) {
    return prisma.weekly_reports.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.weekly_reports.findMany();
  }

  async create(data: any) {
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