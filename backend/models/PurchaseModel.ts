import { prisma } from '@/lib/prisma';

export class PurchaseModel {
  async findById(id: number) {
    return prisma.purchases.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.purchases.findMany();
  }

  async create(data: any) {
    return prisma.purchases.create({ data });
  }

  async update(id: number, data: any) {
    return prisma.purchases.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.purchases.delete({ where: { id } });
  }

  async findByUserId(userId: number) {
    return prisma.purchases.findMany({ where: { userId } });
  }

  async findByRewardId(rewardId: number) {
    return prisma.purchases.findMany({ where: { rewardId } });
  }
} 