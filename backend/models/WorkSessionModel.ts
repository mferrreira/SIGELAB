import { prisma } from '@/lib/prisma';

export class WorkSessionModel {
  async findById(id: number) {
    return prisma.work_sessions.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.work_sessions.findMany();
  }

  async create(data: any) {
    // Prevent overlapping sessions: check for active session
    const activeSession = await prisma.work_sessions.findFirst({
      where: {
        userId: data.userId,
        endTime: null,
      },
    });
    if (activeSession) {
      return activeSession;
    }
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

  async findActiveSessions() {
    return prisma.work_sessions.findMany({
      where: { endTime: null },
      include: { user: true },
    });
  }
} 