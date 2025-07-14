import { prisma } from '@/lib/prisma';

export class DailyLogModel {
  async findById(id: number) {
    return prisma.daily_logs.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.daily_logs.findMany({
      include: { user: true }
    });
  }

  async create(data: any) {
    return prisma.daily_logs.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.daily_logs.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.daily_logs.delete({ where: { id } });
  }

  async findByUserId(userId: number) {
    return prisma.daily_logs.findMany({ where: { userId } });
  }

  async findByProjectId(projectId: number) {
    return prisma.daily_logs.findMany({ where: { projectId } });
  }
} 