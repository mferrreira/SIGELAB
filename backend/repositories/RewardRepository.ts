import { prisma } from '@/lib/database/prisma';
import { Reward } from '../models/Reward';

export class RewardRepository {
    async findById(id: number): Promise<Reward | null> {
        const data = await prisma.rewards.findUnique({
            where: { id }
        });
        return data ? Reward.fromPrisma(data) : null;
    }

    async findAll(): Promise<Reward[]> {
        const data = await prisma.rewards.findMany({
            orderBy: { name: 'asc' }
        });
        return data.map(item => Reward.fromPrisma(item));
    }

    async create(reward: Reward): Promise<Reward> {
        const data = reward.toPrisma();
        delete data.id; // Remove ID for creation
        
        const created = await prisma.rewards.create({ data });
        return Reward.fromPrisma(created);
    }

    async update(reward: Reward): Promise<Reward> {
        if (!reward.id) {
            throw new Error("Reward ID is required for update");
        }

        const data = reward.toPrisma();
        delete data.id; // Don't update the ID
        
        const updated = await prisma.rewards.update({
            where: { id: reward.id },
            data
        });
        return Reward.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        await prisma.rewards.delete({
            where: { id }
        });
    }

    async findAvailable(): Promise<Reward[]> {
        const data = await prisma.rewards.findMany({
            where: { available: true },
            orderBy: { name: 'asc' }
        });
        return data.map(item => Reward.fromPrisma(item));
    }

    async findUnavailable(): Promise<Reward[]> {
        const data = await prisma.rewards.findMany({
            where: { available: false },
            orderBy: { name: 'asc' }
        });
        return data.map(item => Reward.fromPrisma(item));
    }

    async findByPriceRange(minPrice: number, maxPrice: number): Promise<Reward[]> {
        const data = await prisma.rewards.findMany({
            where: {
                price: {
                    gte: minPrice,
                    lte: maxPrice
                }
            },
            orderBy: { price: 'asc' }
        });
        return data.map(item => Reward.fromPrisma(item));
    }

    async findByName(name: string): Promise<Reward[]> {
        const data = await prisma.rewards.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive'
                }
            },
            orderBy: { name: 'asc' }
        });
        return data.map(item => Reward.fromPrisma(item));
    }

    async findAffordable(userPoints: number): Promise<Reward[]> {
        const data = await prisma.rewards.findMany({
            where: {
                available: true,
                price: {
                    lte: userPoints
                }
            },
            orderBy: { price: 'asc' }
        });
        return data.map(item => Reward.fromPrisma(item));
    }

    async getPriceStatistics(): Promise<{
        minPrice: number;
        maxPrice: number;
        averagePrice: number;
        totalRewards: number;
    }> {
        const stats = await prisma.rewards.aggregate({
            _min: { price: true },
            _max: { price: true },
            _avg: { price: true },
            _count: { id: true }
        });

        return {
            minPrice: stats._min.price || 0,
            maxPrice: stats._max.price || 0,
            averagePrice: Math.round(stats._avg.price || 0),
            totalRewards: stats._count.id
        };
    }

    async getAvailableCount(): Promise<number> {
        return await prisma.rewards.count({
            where: { available: true }
        });
    }

    async getUnavailableCount(): Promise<number> {
        return await prisma.rewards.count({
            where: { available: false }
        });
    }
}

