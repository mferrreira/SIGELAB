import { prisma } from '@/lib/prisma';

export class RewardModel {
  async findById(id: number) {
    return prisma.rewards.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.rewards.findMany();
  }

  async create(data: any) {
    // Only allow valid fields
    const filtered = {
      name: data.name,
      description: data.description,
      price: data.price,
      available: data.available !== undefined ? data.available : true,
    };
    return prisma.rewards.create({ data: filtered });
  }

  async update(id: number, data: any) {
    return prisma.rewards.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.rewards.delete({ where: { id } });
  }

  async findAvailable() {
    return prisma.rewards.findMany({ where: { available: true } });
  }
} 