import { prisma } from '@/lib/database/prisma';

export class KanbanBoardModel {
  async findById(id: number) {
    return prisma.kanban_boards.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.kanban_boards.findMany();
  }

  async create(data: any) {
    return prisma.kanban_boards.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.kanban_boards.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.kanban_boards.delete({ where: { id } });
  }
} 