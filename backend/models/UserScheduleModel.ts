import { prisma } from '@/lib/prisma';

export class UserScheduleModel {
  async findById(id: number) {
    return prisma.user_schedules.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.user_schedules.findMany();
  }

  async create(data: any) {
    return prisma.user_schedules.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.user_schedules.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.user_schedules.delete({ where: { id } });
  }

  async findByUserId(userId: number) {
    return prisma.user_schedules.findMany({ where: { userId } });
  }
} 