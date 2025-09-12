import { PurchaseService } from '../services/PurchaseService';
import { PurchaseRepository } from '../repositories/PurchaseRepository';
import { RewardRepository } from '../repositories/RewardRepository';
import { Purchase } from '../models/Purchase';
import { prisma } from '@/lib/database/prisma';

export class PurchaseController {
  private purchaseService = new PurchaseService(
    new PurchaseRepository(),
    new RewardRepository()
  );

  async getPurchase(id: number) {
    return this.purchaseService.findById(id);
  }

  async getAllPurchases() {
    return this.purchaseService.findAll();
  }

  async createPurchase(data: any) {
    // Validate purchase creation
    const validation = await this.purchaseService.validatePurchaseCreation(data.userId, data.rewardId);
    if (!validation.canPurchase) {
      throw new Error(validation.message);
    }

    // Deduct points from user
    const user = validation.user!;
    const reward = validation.reward!;
    
    await prisma.users.update({
      where: { id: data.userId },
      data: {
        points: user.points - reward.price
      }
    });

    // Create purchase
    const purchase = await this.purchaseService.create(data);
    return purchase.toPrisma();
  }

  async updatePurchase(id: number, data: any) {
    const purchase = await this.purchaseService.update(id, data);
    return purchase.toPrisma();
  }

  async deletePurchase(id: number) {
    return this.purchaseService.delete(id);
  }

  async getPurchasesByUser(userId: number) {
    return this.purchaseService.findByUserId(userId);
  }

  async getPurchasesByReward(rewardId: number) {
    return this.purchaseService.findByRewardId(rewardId);
  }

  async getPurchasesByStatus(status: string) {
    return this.purchaseService.findByStatus(status);
  }

  async getPendingPurchases() {
    return this.purchaseService.findPending();
  }

  async getApprovedPurchases() {
    return this.purchaseService.findApproved();
  }

  async getCompletedPurchases() {
    return this.purchaseService.findCompleted();
  }

  async getRejectedPurchases() {
    return this.purchaseService.findRejected();
  }

  // Business logic methods
  async approvePurchase(id: number) {
    const purchase = await this.purchaseService.approvePurchase(id);
    return purchase.toPrisma();
  }

  async rejectPurchase(id: number) {
    const purchase = await this.purchaseService.rejectPurchase(id);
    
    // Refund points to user
    await prisma.users.update({
      where: { id: purchase.userId },
      data: {
        points: {
          increment: purchase.price
        }
      }
    });

    return purchase.toPrisma();
  }

  async completePurchase(id: number) {
    const purchase = await this.purchaseService.completePurchase(id);
    return purchase.toPrisma();
  }

  async cancelPurchase(id: number) {
    const purchase = await this.purchaseService.cancelPurchase(id);
    
    // Refund points if purchase was approved
    if (purchase.status === 'cancelled') {
      await prisma.users.update({
        where: { id: purchase.userId },
        data: {
          points: {
            increment: purchase.price
          }
        }
      });
    }

    return purchase.toPrisma();
  }

  // Analytics methods
  async getPurchaseStatistics() {
    return this.purchaseService.getPurchaseStatistics();
  }

  async getUserPurchaseStatistics(userId: number) {
    return this.purchaseService.getUserPurchaseStatistics(userId);
  }

  async getRewardPurchaseStatistics(rewardId: number) {
    return this.purchaseService.getRewardPurchaseStatistics(rewardId);
  }

  // Search and filter methods
  async searchPurchases(query: {
    userId?: number;
    rewardId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.purchaseService.searchPurchases(query);
  }

  // Bulk operations
  async bulkApprovePurchases(purchaseIds: number[]) {
    const purchases = await this.purchaseService.bulkApprovePurchases(purchaseIds);
    return purchases.map(purchase => purchase.toPrisma());
  }

  async bulkRejectPurchases(purchaseIds: number[]) {
    const purchases = await this.purchaseService.bulkRejectPurchases(purchaseIds);
    
    // Refund points for all rejected purchases
    for (const purchase of purchases) {
      await prisma.users.update({
        where: { id: purchase.userId },
        data: {
          points: {
            increment: purchase.price
          }
        }
      });
    }

    return purchases.map(purchase => purchase.toPrisma());
  }

  // Validation methods
  async validatePurchaseCreation(userId: number, rewardId: number) {
    return this.purchaseService.validatePurchaseCreation(userId, rewardId);
  }
} 