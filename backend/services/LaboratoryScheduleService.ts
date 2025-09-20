import { LaboratorySchedule } from '../models/LaboratorySchedule';
import { LaboratoryScheduleRepository, ILaboratoryScheduleRepository } from '../repositories/LaboratoryScheduleRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from './HistoryService';

export interface ILaboratoryScheduleService {
    findById(id: number): Promise<LaboratorySchedule | null>;
    findAll(): Promise<LaboratorySchedule[]>;
    create(data: Omit<LaboratorySchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<LaboratorySchedule>;
    update(id: number, data: Partial<LaboratorySchedule>): Promise<LaboratorySchedule>;
    delete(id: number): Promise<void>;
    getSchedulesByDay(dayOfWeek: number): Promise<LaboratorySchedule[]>;
    getSchedulesByTimeRange(startTime: string, endTime: string): Promise<LaboratorySchedule[]>;
    canUserManageSchedule(userId: number): Promise<boolean>;
}

export class LaboratoryScheduleService implements ILaboratoryScheduleService {
    constructor(
        private laboratoryScheduleRepo: ILaboratoryScheduleRepository,
        private userRepo: UserRepository,
        private historyService?: HistoryService
    ) {}

    async findById(id: number): Promise<LaboratorySchedule | null> {
        return await this.laboratoryScheduleRepo.findById(id);
    }

    async findAll(): Promise<LaboratorySchedule[]> {
        return await this.laboratoryScheduleRepo.findAll();
    }

    async create(data: Omit<LaboratorySchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<LaboratorySchedule> {
        // Check if user can manage schedules
        const canManage = await this.canUserManageSchedule(data.userId || 0);
        if (!canManage) {
            throw new Error("Usuário não tem permissão para gerenciar horários do laboratório");
        }

        const laboratorySchedule = LaboratorySchedule.create(data);
        const created = await this.laboratoryScheduleRepo.create(laboratorySchedule);

        // Record history
        if (this.historyService && data.userId) {
            await this.historyService.recordEntityCreation(
                "LABORATORY_SCHEDULE",
                created.id!,
                data.userId,
                created.toJSON()
            );
        }

        return created;
    }

    async update(id: number, data: Partial<LaboratorySchedule>): Promise<LaboratorySchedule> {
        const existingSchedule = await this.laboratoryScheduleRepo.findById(id);
        if (!existingSchedule) {
            throw new Error("Horário do laboratório não encontrado");
        }

        // Check if user can manage schedules
        const canManage = await this.canUserManageSchedule(data.userId || 0);
        if (!canManage) {
            throw new Error("Usuário não tem permissão para gerenciar horários do laboratório");
        }

        const oldData = existingSchedule.toJSON();

        // Update fields
        if (data.startTime !== undefined || data.endTime !== undefined || data.notes !== undefined) {
            existingSchedule.updateSchedule(
                data.startTime || existingSchedule.startTime,
                data.endTime || existingSchedule.endTime,
                data.notes
            );
        }

        const updated = await this.laboratoryScheduleRepo.update(existingSchedule);

        // Record history
        if (this.historyService && data.userId) {
            await this.historyService.recordEntityUpdate(
                "LABORATORY_SCHEDULE",
                id,
                data.userId,
                oldData,
                updated.toJSON()
            );
        }

        return updated;
    }

    async delete(id: number): Promise<void> {
        const existingSchedule = await this.laboratoryScheduleRepo.findById(id);
        if (!existingSchedule) {
            throw new Error("Horário do laboratório não encontrado");
        }

        const scheduleData = existingSchedule.toJSON();
        await this.laboratoryScheduleRepo.delete(id);

        // Record history
        if (this.historyService) {
            await this.historyService.recordEntityDeletion(
                "LABORATORY_SCHEDULE",
                id,
                0, // System deletion
                scheduleData
            );
        }
    }

    async getSchedulesByDay(dayOfWeek: number): Promise<LaboratorySchedule[]> {
        return await this.laboratoryScheduleRepo.findByDayOfWeek(dayOfWeek);
    }

    async getSchedulesByTimeRange(startTime: string, endTime: string): Promise<LaboratorySchedule[]> {
        return await this.laboratoryScheduleRepo.findByTimeRange(startTime, endTime);
    }

    async canUserManageSchedule(userId: number): Promise<boolean> {
        if (userId === 0) return false; // System operations

        const user = await this.userRepo.findById(userId);
        if (!user) return false;

        // Only coordinators and managers can manage laboratory schedules
        const hasPermission = user.roles.some(role => 
            ['COORDENADOR', 'GERENTE', 'LABORATORISTA'].includes(role)
        );

        return hasPermission;
    }
}

