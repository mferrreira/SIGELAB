import { LabEvent } from '../models/LabEvent';
import { LabEventRepository, ILabEventRepository } from '../repositories/LabEventRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from './HistoryService';

export interface ILabEventService {
    findById(id: number): Promise<LabEvent | null>;
    findAll(): Promise<LabEvent[]>;
    create(data: Omit<LabEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabEvent>;
    update(id: number, data: Partial<LabEvent>): Promise<LabEvent>;
    delete(id: number): Promise<void>;
    getEventsByDate(date: Date): Promise<LabEvent[]>;
    getEventsByUser(userId: number): Promise<LabEvent[]>;
    getEventsByDateRange(startDate: Date, endDate: Date): Promise<LabEvent[]>;
    canUserCreateEvent(userId: number): Promise<boolean>;
    canUserViewEvent(eventId: number, userId: number): Promise<boolean>;
}

export class LabEventService implements ILabEventService {
    constructor(
        private labEventRepo: ILabEventRepository,
        private userRepo: UserRepository,
        private historyService?: HistoryService
    ) {}

    async findById(id: number): Promise<LabEvent | null> {
        return await this.labEventRepo.findById(id);
    }

    async findAll(): Promise<LabEvent[]> {
        return await this.labEventRepo.findAll();
    }

    async create(data: Omit<LabEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabEvent> {
        const user = await this.userRepo.findById(data.userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const canCreate = await this.canUserCreateEvent(data.userId);
        if (!canCreate) {
            throw new Error("Usuário não tem permissão para criar eventos");
        }

        const labEvent = LabEvent.create(data);
        const created = await this.labEventRepo.create(labEvent);

        if (this.historyService) {
            await this.historyService.recordEntityCreation(
                "LAB_EVENT",
                created.id!,
                data.userId,
                created.toJSON()
            );
        }

        return created;
    }

    async update(id: number, data: Partial<LabEvent>): Promise<LabEvent> {
        const existingEvent = await this.labEventRepo.findById(id);
        if (!existingEvent) {
            throw new Error("Evento não encontrado");
        }

        const canUpdate = await this.canUserViewEvent(id, data.userId || existingEvent.userId);
        if (!canUpdate) {
            throw new Error("Usuário não tem permissão para atualizar este evento");
        }

        const oldData = existingEvent.toJSON();

        if (data.note !== undefined) {
            existingEvent.updateNote(data.note);
        }
        if (data.date !== undefined) {
            existingEvent.updateDate(data.date);
        }

        const updated = await this.labEventRepo.update(existingEvent);

        if (this.historyService) {
            await this.historyService.recordEntityUpdate(
                "LAB_EVENT",
                id,
                data.userId || existingEvent.userId,
                oldData,
                updated.toJSON()
            );
        }

        return updated;
    }

    async delete(id: number): Promise<void> {
        const existingEvent = await this.labEventRepo.findById(id);
        if (!existingEvent) {
            throw new Error("Evento não encontrado");
        }

        const eventData = existingEvent.toJSON();
        await this.labEventRepo.delete(id);

        if (this.historyService) {
            await this.historyService.recordEntityDeletion(
                "LAB_EVENT",
                id,
                existingEvent.userId,
                eventData
            );
        }
    }

    async getEventsByDate(date: Date): Promise<LabEvent[]> {
        return await this.labEventRepo.findByDate(date);
    }

    async getEventsByUser(userId: number): Promise<LabEvent[]> {
        return await this.labEventRepo.findByUser(userId);
    }

    async getEventsByDateRange(startDate: Date, endDate: Date): Promise<LabEvent[]> {
        return await this.labEventRepo.findByDateRange(startDate, endDate);
    }

    async canUserCreateEvent(userId: number): Promise<boolean> {
        const user = await this.userRepo.findById(userId);
        if (!user) return false;

        return user.status === 'active';
    }

    async canUserViewEvent(eventId: number, userId: number): Promise<boolean> {
        const user = await this.userRepo.findById(userId);
        if (!user) return false;

        const event = await this.labEventRepo.findById(eventId);
        if (!event) return false;

        if (event.userId === userId) return true;

        const hasAdminRole = user.roles.some(role => 
            ['COORDENADOR', 'GERENTE', 'LABORATORISTA'].includes(role)
        );

        return hasAdminRole;
    }
}

