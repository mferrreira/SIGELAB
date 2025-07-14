import { prisma } from '@/lib/prisma';

export class WorkSessionModel {
  async findById(id: number) {
    return prisma.work_sessions.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.work_sessions.findMany();
  }

  async create(data: any) {
    if (!data.startTime) {
      data.startTime = new Date().toISOString();
    }
    return prisma.work_sessions.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.work_sessions.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.work_sessions.delete({ where: { id } });
  }

  async findByUserId(userId: number) {
    return prisma.work_sessions.findMany({ where: { userId } });
  }
} 