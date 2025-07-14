import { prisma } from '@/lib/prisma';

export class LaboratoryScheduleModel {
  async findById(id: number) {
    return prisma.laboratory_schedules.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.laboratory_schedules.findMany();
  }

  async create(data: any) {
    return prisma.laboratory_schedules.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.laboratory_schedules.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.laboratory_schedules.delete({ where: { id } });
  }

  async findByDayOfWeek(dayOfWeek: number) {
    return prisma.laboratory_schedules.findMany({ where: { dayOfWeek } });
  }
} 