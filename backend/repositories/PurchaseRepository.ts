import { prisma } from '@/lib/database/prisma';
import { Purchase } from '../models/Purchase';

export class PurchaseRepository {
    async findById(id: number): Promise<Purchase | null> {
        const data = await prisma.purchases.findUnique({
            where: { id },
            include: { user: true, reward: true }
        });
        return data ? Purchase.fromPrisma(data) : null;
    }

    async findAll(): Promise<Purchase[]> {
        const data = await prisma.purchases.findMany({
            include: { user: true, reward: true },
            orderBy: { purchaseDate: 'desc' }
        });
        return data.map(item => Purchase.fromPrisma(item));
    }

    async create(purchase: Purchase): Promise<Purchase> {
        const data = purchase.toPrisma();
        delete data.id; // Remove ID for creation
        
        const created = await prisma.purchases.create({ 
            data,
            include: { user: true, reward: true }
        });
        return Purchase.fromPrisma(created);
    }

    async update(purchase: Purchase): Promise<Purchase> {
        if (!purchase.id) {
            throw new Error("Purchase ID is required for update");
        }

        const data = purchase.toPrisma();
        delete data.id; // Don't update the ID
        
        const updated = await prisma.purchases.update({
            where: { id: purchase.id },
            data,
            include: { user: true, reward: true }
        });
        return Purchase.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        await prisma.purchases.delete({
            where: { id }
        });
    }

    async findByUserId(userId: number): Promise<Purchase[]> {
        const data = await prisma.purchases.findMany({
            where: { userId },
            include: { user: true, reward: true },
            orderBy: { purchaseDate: 'desc' }
        });
        return data.map(item => Purchase.fromPrisma(item));
    }

    async findByRewardId(rewardId: number): Promise<Purchase[]> {
        const data = await prisma.purchases.findMany({
            where: { rewardId },
            include: { user: true, reward: true },
            orderBy: { purchaseDate: 'desc' }
        });
        return data.map(item => Purchase.fromPrisma(item));
    }

    async findByStatus(status: string): Promise<Purchase[]> {
        const data = await prisma.purchases.findMany({
            where: { status },
            include: { user: true, reward: true },
            orderBy: { purchaseDate: 'desc' }
        });
        return data.map(item => Purchase.fromPrisma(item));
    }

    async findPending(): Promise<Purchase[]> {
        return this.findByStatus('pending');
    }

    async findApproved(): Promise<Purchase[]> {
        return this.findByStatus('approved');
    }

    async findCompleted(): Promise<Purchase[]> {
        return this.findByStatus('completed');
    }

    async findRejected(): Promise<Purchase[]> {
        return this.findByStatus('rejected');
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Purchase[]> {
        const data = await prisma.purchases.findMany({
            where: {
                purchaseDate: {
                    gte: startDate.toISOString(),
                    lte: endDate.toISOString()
                }
            },
            include: { user: true, reward: true },
            orderBy: { purchaseDate: 'desc' }
        });
        return data.map(item => Purchase.fromPrisma(item));
    }

    async findByUserAndDateRange(userId: number, startDate: Date, endDate: Date): Promise<Purchase[]> {
        const data = await prisma.purchases.findMany({
            where: {
                userId,
                purchaseDate: {
                    gte: startDate.toISOString(),
                    lte: endDate.toISOString()
                }
            },
            include: { user: true, reward: true },
            orderBy: { purchaseDate: 'desc' }
        });
        return data.map(item => Purchase.fromPrisma(item));
    }

    async getPurchaseStatistics(): Promise<{
        totalPurchases: number;
        pendingPurchases: number;
        approvedPurchases: number;
        completedPurchases: number;
        rejectedPurchases: number;
        totalPointsSpent: number;
        averagePurchaseValue: number;
    }> {
        const [total, pending, approved, completed, rejected, pointsStats] = await Promise.all([
            prisma.purchases.count(),
            prisma.purchases.count({ where: { status: 'pending' } }),
            prisma.purchases.count({ where: { status: 'approved' } }),
            prisma.purchases.count({ where: { status: 'completed' } }),
            prisma.purchases.count({ where: { status: 'rejected' } }),
            prisma.purchases.aggregate({
                _sum: { price: true },
                _avg: { price: true }
            })
        ]);

        return {
            totalPurchases: total,
            pendingPurchases: pending,
            approvedPurchases: approved,
            completedPurchases: completed,
            rejectedPurchases: rejected,
            totalPointsSpent: pointsStats._sum.price || 0,
            averagePurchaseValue: Math.round(pointsStats._avg.price || 0)
        };
    }

    async getUserPurchaseStatistics(userId: number): Promise<{
        totalPurchases: number;
        totalPointsSpent: number;
        averagePurchaseValue: number;
        lastPurchaseDate: Date | null;
    }> {
        const [stats, lastPurchase] = await Promise.all([
            prisma.purchases.aggregate({
                where: { userId },
                _count: { id: true },
                _sum: { price: true },
                _avg: { price: true }
            }),
            prisma.purchases.findFirst({
                where: { userId },
                orderBy: { purchaseDate: 'desc' },
                select: { purchaseDate: true }
            })
        ]);

        return {
            totalPurchases: stats._count.id,
            totalPointsSpent: stats._sum.price || 0,
            averagePurchaseValue: Math.round(stats._avg.price || 0),
            lastPurchaseDate: lastPurchase ? new Date(lastPurchase.purchaseDate) : null
        };
    }

    async getRewardPurchaseStatistics(rewardId: number): Promise<{
        totalPurchases: number;
        totalPointsEarned: number;
        averagePurchaseValue: number;
        lastPurchaseDate: Date | null;
    }> {
        const [stats, lastPurchase] = await Promise.all([
            prisma.purchases.aggregate({
                where: { rewardId },
                _count: { id: true },
                _sum: { price: true },
                _avg: { price: true }
            }),
            prisma.purchases.findFirst({
                where: { rewardId },
                orderBy: { purchaseDate: 'desc' },
                select: { purchaseDate: true }
            })
        ]);

        return {
            totalPurchases: stats._count.id,
            totalPointsEarned: stats._sum.price || 0,
            averagePurchaseValue: Math.round(stats._avg.price || 0),
            lastPurchaseDate: lastPurchase ? new Date(lastPurchase.purchaseDate) : null
        };
    }

    async findUserById(userId: number): Promise<{ id: number; name: string; points: number } | null> {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { id: true, name: true, points: true }
        });
        return user;
    }

    async findRewardById(rewardId: number): Promise<{ id: number; name: string; price: number; available: boolean } | null> {
        const reward = await prisma.rewards.findUnique({
            where: { id: rewardId },
            select: { id: true, name: true, price: true, available: true }
        });
        return reward;
    }
}

