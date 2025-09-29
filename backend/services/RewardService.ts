import { RewardRepository } from '../repositories/RewardRepository';
import { Reward } from '../models/Reward';

export class RewardService {
    constructor(private repo: RewardRepository) {}

    async findById(id: number): Promise<Reward | null> {
        return await this.repo.findById(id);
    }

    async findAll(): Promise<Reward[]> {
        return await this.repo.findAll();
    }

    async create(data: any): Promise<Reward> {
        if (!data.name || !data.name.trim()) {
            throw new Error("Nome da recompensa é obrigatório");
        }

        if (data.price === undefined || data.price < 0) {
            throw new Error("Preço deve ser um número não negativo");
        }

        const reward = Reward.create({
            name: data.name.trim(),
            description: data.description || null,
            price: data.price,
            available: data.available !== undefined ? data.available : true
        });

        if (!reward.isValid()) {
            throw new Error("Dados inválidos para a recompensa");
        }

        return await this.repo.create(reward);
    }

    async update(id: number, data: Partial<Reward>): Promise<Reward> {
        const currentReward = await this.repo.findById(id);
        if (!currentReward) {
            throw new Error("Recompensa não encontrada");
        }

        if (data.name !== undefined) {
            currentReward.updateName(data.name);
        }
        if (data.description !== undefined) {
            currentReward.updateDescription(data.description);
        }
        if (data.price !== undefined) {
            currentReward.updatePrice(data.price);
        }
        if (data.available !== undefined) {
            currentReward.updateAvailability(data.available);
        }

        if (!currentReward.isValid()) {
            throw new Error("Dados inválidos para atualização");
        }

        return await this.repo.update(currentReward);
    }

    async delete(id: number): Promise<void> {
        const reward = await this.repo.findById(id);
        if (!reward) {
            throw new Error("Recompensa não encontrada");
        }

        await this.repo.delete(id);
    }

    async findAvailable(): Promise<Reward[]> {
        return await this.repo.findAvailable();
    }

    async findUnavailable(): Promise<Reward[]> {
        return await this.repo.findUnavailable();
    }

    async findByPriceRange(minPrice: number, maxPrice: number): Promise<Reward[]> {
        if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
            throw new Error("Faixa de preços inválida");
        }
        return await this.repo.findByPriceRange(minPrice, maxPrice);
    }

    async findByName(name: string): Promise<Reward[]> {
        if (!name.trim()) {
            throw new Error("Nome de busca é obrigatório");
        }
        return await this.repo.findByName(name.trim());
    }

    async findAffordable(userPoints: number): Promise<Reward[]> {
        if (userPoints < 0) {
            throw new Error("Pontos do usuário não podem ser negativos");
        }
        return await this.repo.findAffordable(userPoints);
    }

    async toggleAvailability(id: number): Promise<Reward> {
        const reward = await this.repo.findById(id);
        if (!reward) {
            throw new Error("Recompensa não encontrada");
        }

        reward.updateAvailability(!reward.available);
        return await this.repo.update(reward);
    }

    async updatePrice(id: number, newPrice: number): Promise<Reward> {
        const reward = await this.repo.findById(id);
        if (!reward) {
            throw new Error("Recompensa não encontrada");
        }

        reward.updatePrice(newPrice);
        return await this.repo.update(reward);
    }

    async updateName(id: number, newName: string): Promise<Reward> {
        const reward = await this.repo.findById(id);
        if (!reward) {
            throw new Error("Recompensa não encontrada");
        }

        reward.updateName(newName);
        return await this.repo.update(reward);
    }

    async updateDescription(id: number, newDescription: string | null): Promise<Reward> {
        const reward = await this.repo.findById(id);
        if (!reward) {
            throw new Error("Recompensa não encontrada");
        }

        reward.updateDescription(newDescription);
        return await this.repo.update(reward);
    }

    async validatePurchase(rewardId: number, userPoints: number): Promise<{
        canPurchase: boolean;
        message: string;
        reward: Reward | null;
    }> {
        const reward = await this.repo.findById(rewardId);
        if (!reward) {
            return {
                canPurchase: false,
                message: "Recompensa não encontrada",
                reward: null
            };
        }

        const canPurchase = reward.canBePurchased(userPoints);
        const message = reward.getPurchaseValidationMessage(userPoints);

        return {
            canPurchase,
            message,
            reward
        };
    }

    async getPriceStatistics(): Promise<{
        minPrice: number;
        maxPrice: number;
        averagePrice: number;
        totalRewards: number;
    }> {
        return await this.repo.getPriceStatistics();
    }

    async getAvailabilityStatistics(): Promise<{
        available: number;
        unavailable: number;
        total: number;
    }> {
        const [available, unavailable, total] = await Promise.all([
            this.repo.getAvailableCount(),
            this.repo.getUnavailableCount(),
            this.repo.findAll().then(rewards => rewards.length)
        ]);

        return {
            available,
            unavailable,
            total
        };
    }

    async searchRewards(query: {
        name?: string;
        minPrice?: number;
        maxPrice?: number;
        available?: boolean;
        userPoints?: number;
    }): Promise<Reward[]> {
        let rewards: Reward[] = [];

        if (query.name) {
            rewards = await this.repo.findByName(query.name);
        } else {
            rewards = await this.repo.findAll();
        }

        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            const minPrice = query.minPrice || 0;
            const maxPrice = query.maxPrice || Number.MAX_SAFE_INTEGER;
            rewards = rewards.filter(reward => 
                reward.price >= minPrice && reward.price <= maxPrice
            );
        }

        if (query.available !== undefined) {
            rewards = rewards.filter(reward => reward.available === query.available);
        }

        if (query.userPoints !== undefined) {
            rewards = rewards.filter(reward => reward.canBePurchased(query.userPoints!));
        }

        return rewards;
    }

    async bulkUpdateAvailability(rewardIds: number[], available: boolean): Promise<Reward[]> {
        const updatedRewards: Reward[] = [];

        for (const id of rewardIds) {
            const reward = await this.repo.findById(id);
            if (reward) {
                reward.updateAvailability(available);
                const updated = await this.repo.update(reward);
                updatedRewards.push(updated);
            }
        }

        return updatedRewards;
    }

    async bulkUpdatePrices(updates: { id: number; price: number }[]): Promise<Reward[]> {
        const updatedRewards: Reward[] = [];

        for (const update of updates) {
            const reward = await this.repo.findById(update.id);
            if (reward) {
                reward.updatePrice(update.price);
                const updated = await this.repo.update(reward);
                updatedRewards.push(updated);
            }
        }

        return updatedRewards;
    }
}

