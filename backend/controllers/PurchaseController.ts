import { PurchaseModel } from '../models/PurchaseModel';
import { prisma } from '@/lib/database/prisma';

export class PurchaseController {
  private purchaseModel = new PurchaseModel();

  async getPurchase(id: number) {
    return this.purchaseModel.findById(id);
  }

  async getAllPurchases() {
    return this.purchaseModel.findAll();
  }

  async createPurchase(data: any) {
    if (!data.userId || !data.rewardId) {
      throw new Error('userId e rewardId são obrigatórios');
    }
    const reward = await prisma.rewards.findUnique({ where: { id: data.rewardId } });
    if (!reward) {
      throw new Error('Recompensa não encontrada');
    }
    const purchaseData = {
      userId: data.userId,
      rewardId: data.rewardId,
      rewardName: reward.name,
      price: reward.price,
      purchaseDate: new Date().toISOString(),
      status: 'pending',
    };
    return this.purchaseModel.create(purchaseData);
  }

  async updatePurchase(id: number, data: any) {
    return this.purchaseModel.update(id, data);
  }

  async deletePurchase(id: number) {
    return this.purchaseModel.delete(id);
  }

  async getPurchasesByUser(userId: number) {
    return this.purchaseModel.findByUserId(userId);
  }

  async getPurchasesByReward(rewardId: number) {
    return this.purchaseModel.findByRewardId(rewardId);
  }
} 