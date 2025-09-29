import { NotificationService, INotificationService } from '../services/NotificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { UserRepository } from '../repositories/UserRepository';

export class NotificationController {
    private notificationService: INotificationService;

    constructor() {
        const notificationRepository = new NotificationRepository();
        this.notificationService = new NotificationService(notificationRepository);
    }

    async getNotifications(userId: number) {
        try {
            const notifications = await this.notificationService.findByUserId(userId);
            return {
                success: true,
                notifications: notifications.map(n => n.toJSON())
            };
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            throw new Error('Erro ao buscar notificações');
        }
    }

    async getUnreadNotifications(userId: number) {
        try {
            const notifications = await this.notificationService.findUnreadByUserId(userId);
            return {
                success: true,
                notifications: notifications.map(n => n.toJSON())
            };
        } catch (error) {
            console.error('Erro ao buscar notificações não lidas:', error);
            throw new Error('Erro ao buscar notificações não lidas');
        }
    }

    async getUnreadCount(userId: number) {
        try {
            const count = await this.notificationService.getUnreadCount(userId);
            return {
                success: true,
                count
            };
        } catch (error) {
            console.error('Erro ao buscar contagem de notificações:', error);
            throw new Error('Erro ao buscar contagem de notificações');
        }
    }

    async markAsRead(notificationId: number, userId: number) {
        try {
            // Verificar se a notificação pertence ao usuário
            const notification = await this.notificationService.findById(notificationId);
            if (!notification) {
                throw new Error('Notificação não encontrada');
            }

            if (notification.userId !== userId) {
                throw new Error('Notificação não pertence ao usuário');
            }

            await this.notificationService.markAsRead(notificationId);
            return {
                success: true,
                message: 'Notificação marcada como lida'
            };
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
            throw new Error('Erro ao marcar notificação como lida');
        }
    }

    async markAllAsRead(userId: number) {
        try {
            await this.notificationService.markAllAsRead(userId);
            return {
                success: true,
                message: 'Todas as notificações foram marcadas como lidas'
            };
        } catch (error) {
            console.error('Erro ao marcar todas as notificações como lidas:', error);
            throw new Error('Erro ao marcar todas as notificações como lidas');
        }
    }

    async deleteNotification(notificationId: number, userId: number) {
        try {
            // Verificar se a notificação pertence ao usuário
            const notification = await this.notificationService.findById(notificationId);
            if (!notification) {
                throw new Error('Notificação não encontrada');
            }

            if (notification.userId !== userId) {
                throw new Error('Notificação não pertence ao usuário');
            }

            await this.notificationService.delete(notificationId);
            return {
                success: true,
                message: 'Notificação excluída'
            };
        } catch (error) {
            console.error('Erro ao excluir notificação:', error);
            throw new Error('Erro ao excluir notificação');
        }
    }

    // Métodos para criar notificações específicas
    async createTaskReviewRequest(taskId: number, taskTitle: string, userId: number, projectLeaderId: number) {
        try {
            const notification = await this.notificationService.createTaskReviewRequest(
                taskId, 
                taskTitle, 
                userId, 
                projectLeaderId
            );
            return {
                success: true,
                notification: notification.toJSON()
            };
        } catch (error) {
            console.error('Erro ao criar notificação de revisão:', error);
            throw new Error('Erro ao criar notificação de revisão');
        }
    }

    async createTaskApproved(taskId: number, taskTitle: string, userId: number) {
        try {
            const notification = await this.notificationService.createTaskApproved(
                taskId, 
                taskTitle, 
                userId
            );
            return {
                success: true,
                notification: notification.toJSON()
            };
        } catch (error) {
            console.error('Erro ao criar notificação de aprovação:', error);
            throw new Error('Erro ao criar notificação de aprovação');
        }
    }

    async createTaskRejected(taskId: number, taskTitle: string, userId: number, reason?: string) {
        try {
            const notification = await this.notificationService.createTaskRejected(
                taskId, 
                taskTitle, 
                userId, 
                reason
            );
            return {
                success: true,
                notification: notification.toJSON()
            };
        } catch (error) {
            console.error('Erro ao criar notificação de rejeição:', error);
            throw new Error('Erro ao criar notificação de rejeição');
        }
    }
}


