import { Notification, INotification, NotificationType } from '../models/Notification';
import { NotificationRepository, INotificationRepository } from '../repositories/NotificationRepository';
import { UserRepository } from '../repositories/UserRepository';

export interface INotificationService {
    findById(id: number): Promise<Notification | null>;
    findByUserId(userId: number): Promise<Notification[]>;
    findUnreadByUserId(userId: number): Promise<Notification[]>;
    create(notification: Omit<INotification, 'id' | 'read' | 'createdAt' | 'readAt'>): Promise<Notification>;
    markAsRead(id: number): Promise<void>;
    markAllAsRead(userId: number): Promise<void>;
    getUnreadCount(userId: number): Promise<number>;
    delete(id: number): Promise<void>;
    
    // Métodos específicos para diferentes tipos de notificação
    createTaskReviewRequest(taskId: number, taskTitle: string, userId: number, projectLeaderId: number): Promise<Notification>;
    createTaskApproved(taskId: number, taskTitle: string, userId: number): Promise<Notification>;
    createTaskRejected(taskId: number, taskTitle: string, userId: number, reason?: string): Promise<Notification>;
    createTaskAssigned(taskId: number, taskTitle: string, userId: number): Promise<Notification>;
    createProjectInvitation(projectId: number, projectName: string, userId: number, inviterName: string): Promise<Notification>;
    createSystemAnnouncement(title: string, message: string, userIds: number[]): Promise<Notification[]>;
}

export class NotificationService implements INotificationService {
    private userRepository: UserRepository;

    constructor(
        private notificationRepository: INotificationRepository
    ) {
        this.userRepository = new UserRepository();
    }

    async findById(id: number): Promise<Notification | null> {
        return await this.notificationRepository.findById(id);
    }

    async findByUserId(userId: number): Promise<Notification[]> {
        return await this.notificationRepository.findByUserId(userId);
    }

    async findUnreadByUserId(userId: number): Promise<Notification[]> {
        return await this.notificationRepository.findUnreadByUserId(userId);
    }

    async create(notificationData: Omit<INotification, 'id' | 'read' | 'createdAt' | 'readAt'>): Promise<Notification> {
        const notification = Notification.create(notificationData);
        return await this.notificationRepository.create(notification);
    }

    async markAsRead(id: number): Promise<void> {
        await this.notificationRepository.markAsRead(id);
    }

    async markAllAsRead(userId: number): Promise<void> {
        await this.notificationRepository.markAllAsRead(userId);
    }

    async getUnreadCount(userId: number): Promise<number> {
        return await this.notificationRepository.getUnreadCount(userId);
    }

    async delete(id: number): Promise<void> {
        await this.notificationRepository.delete(id);
    }

    // Métodos específicos para diferentes tipos de notificação
    async createTaskReviewRequest(taskId: number, taskTitle: string, userId: number, projectLeaderId: number): Promise<Notification> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        return await this.create({
            userId: projectLeaderId,
            type: NotificationType.TASK_REVIEW_REQUEST,
            title: 'Tarefa em Revisão',
            message: `${user.name} marcou a tarefa "${taskTitle}" como "Em Revisão"`,
            data: {
                taskId,
                taskTitle,
                userId,
                userName: user.name
            }
        });
    }

    async createTaskApproved(taskId: number, taskTitle: string, userId: number): Promise<Notification> {
        return await this.create({
            userId,
            type: NotificationType.TASK_APPROVED,
            title: 'Tarefa Aprovada',
            message: `Sua tarefa "${taskTitle}" foi aprovada! Você recebeu os pontos.`,
            data: {
                taskId,
                taskTitle
            }
        });
    }

    async createTaskRejected(taskId: number, taskTitle: string, userId: number, reason?: string): Promise<Notification> {
        const message = reason 
            ? `Sua tarefa "${taskTitle}" precisa de ajustes. Motivo: ${reason}`
            : `Sua tarefa "${taskTitle}" precisa de ajustes.`;

        return await this.create({
            userId,
            type: NotificationType.TASK_REJECTED,
            title: 'Tarefa Rejeitada',
            message,
            data: {
                taskId,
                taskTitle,
                reason
            }
        });
    }

    async createTaskAssigned(taskId: number, taskTitle: string, userId: number): Promise<Notification> {
        return await this.create({
            userId,
            type: NotificationType.TASK_ASSIGNED,
            title: 'Nova Tarefa Atribuída',
            message: `Uma nova tarefa foi atribuída a você: "${taskTitle}"`,
            data: {
                taskId,
                taskTitle
            }
        });
    }

    async createProjectInvitation(projectId: number, projectName: string, userId: number, inviterName: string): Promise<Notification> {
        return await this.create({
            userId,
            type: NotificationType.PROJECT_INVITATION,
            title: 'Convite para Projeto',
            message: `${inviterName} convidou você para participar do projeto "${projectName}"`,
            data: {
                projectId,
                projectName,
                inviterName
            }
        });
    }

    async createSystemAnnouncement(title: string, message: string, userIds: number[]): Promise<Notification[]> {
        const notifications: Notification[] = [];
        
        for (const userId of userIds) {
            const notification = await this.create({
                userId,
                type: NotificationType.SYSTEM_ANNOUNCEMENT,
                title,
                message,
                data: {
                    isSystem: true
                }
            });
            notifications.push(notification);
        }

        return notifications;
    }
}


