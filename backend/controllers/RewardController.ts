import { RewardModel } from '../models/RewardModel';

export class RewardController {
  private rewardModel = new RewardModel();

  async getReward(id: number) {
    return this.rewardModel.findById(id);
  }

  async getAllRewards() {
    return this.rewardModel.findAll();
  }

  async createReward(request: Request) {
    try {
      const data = await request.json();
      const reward = await this.rewardModel.create(data);
      return new Response(JSON.stringify({ reward }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
      console.error('Erro ao criar recompensa:', error);
      return new Response(JSON.stringify({ error: 'Erro ao criar recompensa', details: error?.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  async updateReward(id: number, data: any) {
    return this.rewardModel.update(id, data);
  }

  async deleteReward(id: number) {
    return this.rewardModel.delete(id);
  }

  async getAvailableRewards() {
    return this.rewardModel.findAvailable();
  }
} 