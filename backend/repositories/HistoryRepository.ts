import { prisma } from '@/lib/database/prisma';
import { History } from '../models/History';
import { HistoryEntity, HistoryAction } from '../models/History';

export interface IHistoryRepository {
  findById(id: number): Promise<History | null>;
  findAll(): Promise<History[]>;
  create(history: History): Promise<History>;
  findByEntity(entityType: HistoryEntity, entityId: number): Promise<History[]>;
  findByUser(userId: number): Promise<History[]>;
  findByAction(action: HistoryAction): Promise<History[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<History[]>;
  findByPerformer(performerId: number): Promise<History[]>;
  findRecent(limit?: number): Promise<History[]>;
  findEntityHistory(entityType: HistoryEntity, entityId: number, limit?: number): Promise<History[]>;
  findUserActivity(userId: number, limit?: number): Promise<History[]>;
  findSystemActivity(limit?: number): Promise<History[]>;
  countByEntity(entityType: HistoryEntity): Promise<number>;
  countByUser(userId: number): Promise<number>;
  countByAction(action: HistoryAction): Promise<number>;
  getActivitySummary(startDate: Date, endDate: Date): Promise<any>;
}

export class HistoryRepository implements IHistoryRepository {
  private getIncludeOptions() {
    return {
      performer: {
        select: {
          id: true,
          name: true,
          email: true,
          roles: true
        }
      }
    };
  }

  async findById(id: number): Promise<History | null> {
    const data = await prisma.history.findUnique({
      where: { id },
      include: this.getIncludeOptions()
    });
    return data ? History.fromPrisma(data) : null;
  }

  async findAll(): Promise<History[]> {
    const data = await prisma.history.findMany({
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' }
    });
    return data.map(history => History.fromPrisma(history));
  }

  async create(history: History): Promise<History> {
    const data = await prisma.history.create({
      data: history.toPrisma(),
      include: this.getIncludeOptions()
    });
    return History.fromPrisma(data);
  }

  async findByEntity(entityType: HistoryEntity, entityId: number): Promise<History[]> {
    const data = await prisma.history.findMany({
      where: {
        entityType,
        entityId
      },
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' }
    });
    return data.map(history => History.fromPrisma(history));
  }

  async findByUser(userId: number): Promise<History[]> {
    const data = await prisma.history.findMany({
      where: { performedBy: userId },
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' }
    });
    return data.map(history => History.fromPrisma(history));
  }

  async findByAction(action: HistoryAction): Promise<History[]> {
    const data = await prisma.history.findMany({
      where: { action },
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' }
    });
    return data.map(history => History.fromPrisma(history));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<History[]> {
    const data = await prisma.history.findMany({
      where: {
        performedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' }
    });
    return data.map(history => History.fromPrisma(history));
  }

  async findByPerformer(performerId: number): Promise<History[]> {
    const data = await prisma.history.findMany({
      where: { performedBy: performerId },
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' }
    });
    return data.map(history => History.fromPrisma(history));
  }

  async findRecent(limit: number = 50): Promise<History[]> {
    const data = await prisma.history.findMany({
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' },
      take: limit
    });
    return data.map(history => History.fromPrisma(history));
  }

  async findEntityHistory(entityType: HistoryEntity, entityId: number, limit: number = 20): Promise<History[]> {
    const data = await prisma.history.findMany({
      where: {
        entityType,
        entityId
      },
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' },
      take: limit
    });
    return data.map(history => History.fromPrisma(history));
  }

  async findUserActivity(userId: number, limit: number = 20): Promise<History[]> {
    const data = await prisma.history.findMany({
      where: { performedBy: userId },
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' },
      take: limit
    });
    return data.map(history => History.fromPrisma(history));
  }

  async findSystemActivity(limit: number = 50): Promise<History[]> {
    const data = await prisma.history.findMany({
      include: this.getIncludeOptions(),
      orderBy: { performedAt: 'desc' },
      take: limit
    });
    return data.map(history => History.fromPrisma(history));
  }

  async countByEntity(entityType: HistoryEntity): Promise<number> {
    return await prisma.history.count({
      where: { entityType }
    });
  }

  async countByUser(userId: number): Promise<number> {
    return await prisma.history.count({
      where: { performedBy: userId }
    });
  }

  async countByAction(action: HistoryAction): Promise<number> {
    return await prisma.history.count({
      where: { action }
    });
  }

  async getActivitySummary(startDate: Date, endDate: Date): Promise<any> {
    const activities = await prisma.history.findMany({
      where: {
        performedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: this.getIncludeOptions()
    });

    const summary = {
      totalActivities: activities.length,
      byEntity: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      dailyActivity: {} as Record<string, number>
    };

    activities.forEach(activity => {
      // Count by entity
      summary.byEntity[activity.entityType] = (summary.byEntity[activity.entityType] || 0) + 1;
      
      // Count by action
      summary.byAction[activity.action] = (summary.byAction[activity.action] || 0) + 1;
      
      // Count by user
      const userName = activity.performer?.name || `User ${activity.performedBy}`;
      summary.byUser[userName] = (summary.byUser[userName] || 0) + 1;
      
      // Count by day
      const day = activity.performedAt.toISOString().split('T')[0];
      summary.dailyActivity[day] = (summary.dailyActivity[day] || 0) + 1;
    });

    return summary;
  }
}

