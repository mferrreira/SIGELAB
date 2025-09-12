import { prisma } from '@/lib/database/prisma';
import { DailyLog } from '../models/DailyLog';

export class DailyLogRepository {
    async findById(id: number): Promise<DailyLog | null> {
        const data = await prisma.daily_logs.findUnique({
            where: { id },
            include: { user: true, project: true }
        });
        return data ? DailyLog.fromPrisma(data) : null;
    }

    async findAll(): Promise<DailyLog[]> {
        const data = await prisma.daily_logs.findMany({
            include: { user: true, project: true },
            orderBy: { createdAt: 'desc' }
        });
        return data.map(item => DailyLog.fromPrisma(item));
    }

    async create(dailyLog: DailyLog): Promise<DailyLog> {
        const data = dailyLog.toPrisma();
        // Remove fields that shouldn't be in create operation
        delete data.id;
        delete data.createdAt;
        
        const created = await prisma.daily_logs.create({ 
            data,
            include: { user: true, project: true }
        });
        return DailyLog.fromPrisma(created);
    }

    async update(dailyLog: DailyLog): Promise<DailyLog> {
        if (!dailyLog.id) {
            throw new Error("DailyLog ID is required for update");
        }

        const data = dailyLog.toPrisma();
        delete data.id; // Don't update the ID
        delete data.createdAt; // Don't update createdAt
        
        const updated = await prisma.daily_logs.update({
            where: { id: dailyLog.id },
            data,
            include: { user: true, project: true }
        });
        return DailyLog.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        await prisma.daily_logs.delete({
            where: { id }
        });
    }

    async findByUserId(userId: number): Promise<DailyLog[]> {
        const data = await prisma.daily_logs.findMany({
            where: { userId },
            include: { user: true, project: true },
            orderBy: { date: 'desc' }
        });
        return data.map(item => DailyLog.fromPrisma(item));
    }

    async findByProjectId(projectId: number): Promise<DailyLog[]> {
        const data = await prisma.daily_logs.findMany({
            where: { projectId },
            include: { user: true, project: true },
            orderBy: { date: 'desc' }
        });
        return data.map(item => DailyLog.fromPrisma(item));
    }

    async findByWorkSessionId(workSessionId: number): Promise<DailyLog | null> {
        const data = await prisma.daily_logs.findFirst({
            where: { workSessionId },
            include: { user: true, project: true }
        });
        return data ? DailyLog.fromPrisma(data) : null;
    }

    async findByDateRange(userId: number, startDate: Date, endDate: Date): Promise<DailyLog[]> {
        const data = await prisma.daily_logs.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: { user: true, project: true },
            orderBy: { date: 'desc' }
        });
        return data.map(item => DailyLog.fromPrisma(item));
    }

    async findByDate(userId: number, date: Date): Promise<DailyLog[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return this.findByDateRange(userId, startOfDay, endOfDay);
    }

    async findUserById(userId: number): Promise<{ id: number; name: string } | null> {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { id: true, name: true }
        });
        return user;
    }
}
