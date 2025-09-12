import { RewardService } from '../services/RewardService';
import { RewardRepository } from '../repositories/RewardRepository';
import { Reward } from '../models/Reward';

export class RewardController {
  private rewardService = new RewardService(new RewardRepository());

  async getReward(id: number) {
    return this.rewardService.findById(id);
  }

  async getAllRewards() {
    return this.rewardService.findAll();
  }

  async createReward(request: Request) {
    try {
      const data = await request.json();
      const reward = await this.rewardService.create(data);
      return new Response(JSON.stringify({ reward: reward.toPrisma() }), { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      });
    } catch (error: any) {
      console.error('Erro ao criar recompensa:', error);
      return new Response(JSON.stringify({ 
        error: 'Erro ao criar recompensa', 
        details: error?.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }

  async updateReward(id: number, data: any) {
    const reward = await this.rewardService.update(id, data);
    return reward.toPrisma();
  }

  async deleteReward(id: number) {
    return this.rewardService.delete(id);
  }

  async getAvailableRewards() {
    return this.rewardService.findAvailable();
  }

  async getUnavailableRewards() {
    return this.rewardService.findUnavailable();
  }

  async toggleAvailability(id: number) {
    const reward = await this.rewardService.toggleAvailability(id);
    return reward.toPrisma();
  }

  async updatePrice(id: number, newPrice: number) {
    const reward = await this.rewardService.updatePrice(id, newPrice);
    return reward.toPrisma();
  }

  async updateName(id: number, newName: string) {
    const reward = await this.rewardService.updateName(id, newName);
    return reward.toPrisma();
  }

  async updateDescription(id: number, newDescription: string | null) {
    const reward = await this.rewardService.updateDescription(id, newDescription);
    return reward.toPrisma();
  }

  async findByPriceRange(minPrice: number, maxPrice: number) {
    return this.rewardService.findByPriceRange(minPrice, maxPrice);
  }

  async findByName(name: string) {
    return this.rewardService.findByName(name);
  }

  async findAffordable(userPoints: number) {
    return this.rewardService.findAffordable(userPoints);
  }

  async validatePurchase(rewardId: number, userPoints: number) {
    return this.rewardService.validatePurchase(rewardId, userPoints);
  }

  async getPriceStatistics() {
    return this.rewardService.getPriceStatistics();
  }

  async getAvailabilityStatistics() {
    return this.rewardService.getAvailabilityStatistics();
  }

  async searchRewards(query: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    userPoints?: number;
  }) {
    return this.rewardService.searchRewards(query);
  }

  async bulkUpdateAvailability(rewardIds: number[], available: boolean) {
    const rewards = await this.rewardService.bulkUpdateAvailability(rewardIds, available);
    return rewards.map(reward => reward.toPrisma());
  }

  async bulkUpdatePrices(updates: { id: number; price: number }[]) {
    const rewards = await this.rewardService.bulkUpdatePrices(updates);
    return rewards.map(reward => reward.toPrisma());
  }
} 