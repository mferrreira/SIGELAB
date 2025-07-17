import { prisma } from '@/lib/database/prisma';

export class LabResponsibilityModel {
  async findById(id: number) {
    return prisma.lab_responsibilities.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.lab_responsibilities.findMany();
  }

  async create(data: any) {
    return prisma.lab_responsibilities.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.lab_responsibilities.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.lab_responsibilities.delete({ where: { id } });
  }

  async findByUserId(userId: number) {
    return prisma.lab_responsibilities.findMany({ where: { userId } });
  }
} 