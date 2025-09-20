import { UserSchedule } from '../models/UserSchedule';
import { UserScheduleRepository, IUserScheduleRepository } from '../repositories/UserScheduleRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from './HistoryService';

export interface IUserScheduleService {
    findById(id: number): Promise<UserSchedule | null>;
    findAll(): Promise<UserSchedule[]>;
    create(data: Omit<UserSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSchedule>;
    update(id: number, data: Partial<UserSchedule>): Promise<UserSchedule>;
    delete(id: number): Promise<void>;
    getSchedulesByUser(userId: number): Promise<UserSchedule[]>;
}

export class UserScheduleService implements IUserScheduleService {
    constructor(
        private userScheduleRepo: IUserScheduleRepository,
        private userRepo: UserRepository,
        private historyService?: HistoryService
    ) {}

    async findById(id: number): Promise<UserSchedule | null> {
        return await this.userScheduleRepo.findById(id);
    }

    async findAll(): Promise<UserSchedule[]> {
        return await this.userScheduleRepo.findAll();
    }

    async create(data: Omit<UserSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSchedule> {
        // Validate user exists
        const user = await this.userRepo.findById(data.userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        // Check if user can manage this schedule
        const canManage = await this.canUserManageSchedule(data.userId, data.userId);
        if (!canManage) {
            throw new Error("Usuário não tem permissão para gerenciar este horário");
        }

        const userSchedule = UserSchedule.create(data);
        const created = await this.userScheduleRepo.create(userSchedule);

        // Record history
        if (this.historyService) {
            await this.historyService.recordEntityCreation(
                "USER_SCHEDULE",
                created.id!,
                data.userId,
                created.toJSON()
            );
        }

        return created;
    }

    async update(id: number, data: Partial<UserSchedule>): Promise<UserSchedule> {
        const existingSchedule = await this.userScheduleRepo.findById(id);
        if (!existingSchedule) {
            throw new Error("Horário não encontrado");
        }

        // Check if user can manage this schedule
        const canManage = await this.canUserManageSchedule(data.userId || existingSchedule.userId, existingSchedule.userId);
        if (!canManage) {
            throw new Error("Usuário não tem permissão para gerenciar este horário");
        }

        const oldData = existingSchedule.toJSON();

        // Update fields
        if (data.startTime !== undefined || data.endTime !== undefined) {
            existingSchedule.updateSchedule(
                data.startTime || existingSchedule.startTime,
                data.endTime || existingSchedule.endTime
            );
        }

        if (data.isActive !== undefined) {
            if (data.isActive) {
                existingSchedule.activate();
            } else {
                existingSchedule.deactivate();
            }
        }

        const updated = await this.userScheduleRepo.update(existingSchedule);

        // Record history
        if (this.historyService) {
            await this.historyService.recordEntityUpdate(
                "USER_SCHEDULE",
                id,
                existingSchedule.userId,
                oldData,
                updated.toJSON()
            );
        }

        return updated;
    }

    async delete(id: number): Promise<void> {
        const schedule = await this.userScheduleRepo.findById(id);
        if (!schedule) {
            throw new Error("Horário não encontrado");
        }

        const scheduleData = schedule.toJSON();
        await this.userScheduleRepo.delete(id);

        // Record history
        if (this.historyService) {
            await this.historyService.recordEntityDeletion(
                "USER_SCHEDULE",
                id,
                schedule.userId,
                scheduleData
            );
        }
    }

    async getSchedulesByUser(userId: number): Promise<UserSchedule[]> {
        return await this.userScheduleRepo.findByUserId(userId);
    }

    async canUserManageSchedule(userId: number, targetUserId?: number): Promise<boolean> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            return false;
        }

        // Admin and coordinators can manage any schedule
        if (user.hasAnyRole(['COORDENADOR'])) {
            return true;
        }

        // Users can manage their own schedules
        if (!targetUserId || userId === targetUserId) {
            return true;
        }

        return false;
    }
}