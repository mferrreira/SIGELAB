import { prisma } from '@/lib/database/prisma';
import { Notification, INotification } from '../models/Notification';

export interface INotificationRepository {
    findById(id: number): Promise<Notification | null>;
    findByUserId(userId: number): Promise<Notification[]>;
    findUnreadByUserId(userId: number): Promise<Notification[]>;
    create(notification: Notification): Promise<Notification>;
    update(notification: Notification): Promise<Notification>;
    delete(id: number): Promise<void>;
    markAsRead(id: number): Promise<void>;
    markAllAsRead(userId: number): Promise<void>;
    getUnreadCount(userId: number): Promise<number>;
}

export class NotificationRepository implements INotificationRepository {
    async findById(id: number): Promise<Notification | null> {
        const notification = await prisma.notifications.findUnique({
            where: { id }
        });

        return notification ? Notification.fromPrisma(notification) : null;
    }

    async findByUserId(userId: number): Promise<Notification[]> {
        const notifications = await prisma.notifications.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return notifications.map(notification => Notification.fromPrisma(notification));
    }

    async findUnreadByUserId(userId: number): Promise<Notification[]> {
        const notifications = await prisma.notifications.findMany({
            where: { 
                userId,
                read: false
            },
            orderBy: { createdAt: 'desc' }
        });

        return notifications.map(notification => Notification.fromPrisma(notification));
    }

    async create(notification: Notification): Promise<Notification> {
        const errors = notification.validate();
        if (errors.length > 0) {
            throw new Error(`Dados inválidos: ${errors.join(', ')}`);
        }

        const created = await prisma.notifications.create({
            data: notification.toPrisma()
        });

        return Notification.fromPrisma(created);
    }

    async update(notification: Notification): Promise<Notification> {
        if (!notification.id) {
            throw new Error('ID da notificação é obrigatório para atualização');
        }

        const updated = await prisma.notifications.update({
            where: { id: notification.id },
            data: notification.toPrisma()
        });

        return Notification.fromPrisma(updated);
    }

    async delete(id: number): Promise<void> {
        await prisma.notifications.delete({
            where: { id }
        });
    }

    async markAsRead(id: number): Promise<void> {
        await prisma.notifications.update({
            where: { id },
            data: { 
                read: true,
                readAt: new Date()
            }
        });
    }

    async markAllAsRead(userId: number): Promise<void> {
        await prisma.notifications.updateMany({
            where: { 
                userId,
                read: false
            },
            data: { 
                read: true,
                readAt: new Date()
            }
        });
    }

    async getUnreadCount(userId: number): Promise<number> {
        const count = await prisma.notifications.count({
            where: { 
                userId,
                read: false
            }
        });

        return count;
    }
}


