import { prisma } from '@/lib/database/prisma';

export class TaskModel {
  async findById(id: number) {
    return prisma.tasks.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.tasks.findMany();
  }

  async create(data: any) {
    return prisma.tasks.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.tasks.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.tasks.delete({ where: { id } });
  }

  async findByProjectId(projectId: number) {
    return prisma.tasks.findMany({ where: { projectId } });
  }

  async findByAssigneeId(userId: number) {
    return prisma.tasks.findMany({ where: { assignedTo: userId } });
  }

  async findByStatus(status: string) {
    return prisma.tasks.findMany({ where: { status } });
  }
} 