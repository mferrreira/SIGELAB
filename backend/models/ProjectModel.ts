import { prisma } from '@/lib/database/prisma';

export class ProjectModel {
  async findById(id: number) {
    return prisma.projects.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.projects.findMany();
  }

  async create(data: any) {
    return prisma.projects.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.projects.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.projects.delete({ where: { id } });
  }

  async findByUserId(userId: number) {
    // Find projects where user is a member
    return prisma.projects.findMany({
      where: {
        members: {
          some: { userId }
        }
      }
    });
  }

  async findByStatus(status: string) {
    return prisma.projects.findMany({ where: { status } });
  }
} 