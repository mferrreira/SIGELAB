import { PrismaClient } from '@prisma/client';

export interface IIssue {
    id?: number;
    title: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
    category?: string | null;
    reporterId: number;
    assigneeId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    resolvedAt?: Date | null;
}

export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

export class Issue {
    public id?: number;
    public title: string;
    public description: string;
    public status: IssueStatus;
    public priority: IssuePriority;
    public category?: string | null;
    public reporterId: number;
    public assigneeId?: number | null;
    public createdAt?: Date;
    public updatedAt?: Date;
    public resolvedAt?: Date | null;

    constructor(data: IIssue) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.status = data.status;
        this.priority = data.priority;
        this.category = data.category;
        this.reporterId = data.reporterId;
        this.assigneeId = data.assigneeId;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.resolvedAt = data.resolvedAt;
    }

    static create(data: Omit<IIssue, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt'>): Issue {
        return new Issue({
            ...data,
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
            resolvedAt: null,
        });
    }

    static fromPrisma(data: any): Issue {
        return new Issue({
            id: data.id,
            title: data.title,
            description: data.description,
            status: data.status as IssueStatus,
            priority: data.priority as IssuePriority,
            category: data.category,
            reporterId: data.reporterId,
            assigneeId: data.assigneeId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            resolvedAt: data.resolvedAt,
        });
    }

    updateTitle(title: string): Issue {
        if (!title || title.trim().length === 0) {
            throw new Error("Título do issue é obrigatório");
        }
        this.title = title.trim();
        this.updatedAt = new Date();
        return this;
    }

    updateDescription(description: string): Issue {
        if (!description || description.trim().length === 0) {
            throw new Error("Descrição do issue é obrigatória");
        }
        this.description = description.trim();
        this.updatedAt = new Date();
        return this;
    }

    updatePriority(priority: IssuePriority): Issue {
        const validPriorities: IssuePriority[] = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
            throw new Error("Prioridade inválida");
        }
        this.priority = priority;
        this.updatedAt = new Date();
        return this;
    }

    updateCategory(category: string | null): Issue {
        this.category = category;
        this.updatedAt = new Date();
        return this;
    }

    assignTo(assigneeId: number): Issue {
        this.assigneeId = assigneeId;
        this.status = 'in_progress';
        this.updatedAt = new Date();
        return this;
    }

    unassign(): Issue {
        this.assigneeId = null;
        this.status = 'open';
        this.updatedAt = new Date();
        return this;
    }

    startProgress(): Issue {
        if (this.status !== 'open') {
            throw new Error("Apenas issues abertos podem ser iniciados");
        }
        this.status = 'in_progress';
        this.updatedAt = new Date();
        return this;
    }

    resolve(): Issue {
        if (this.status === 'closed') {
            throw new Error("Issue já está fechado");
        }
        this.status = 'resolved';
        this.resolvedAt = new Date();
        this.updatedAt = new Date();
        return this;
    }

    setResolution(resolution: string): Issue {
        if (!resolution || resolution.trim().length === 0) {
            throw new Error("Descrição da resolução é obrigatória");
        }
        return this;
    }

    close(): Issue {
        if (this.status === 'closed') {
            throw new Error("Issue já está fechado");
        }
        this.status = 'closed';
        this.updatedAt = new Date();
        return this;
    }

    reopen(): Issue {
        if (this.status !== 'closed') {
            throw new Error("Apenas issues fechados podem ser reabertos");
        }
        this.status = 'open';
        this.resolvedAt = null;
        this.updatedAt = new Date();
        return this;
    }

    isValid(): boolean {
        return !!(
            this.title &&
            this.description &&
            this.reporterId
        );
    }

    canBeAssigned(): boolean {
        return this.status === 'open' || this.status === 'in_progress';
    }

    canBeResolved(): boolean {
        return this.status === 'in_progress';
    }

    canBeClosed(): boolean {
        return this.status === 'resolved' || this.status === 'open';
    }

    isAssigned(): boolean {
        return this.assigneeId !== null && this.assigneeId !== undefined;
    }

    isResolved(): boolean {
        return this.status === 'resolved' || this.status === 'closed';
    }

    isOpen(): boolean {
        return this.status === 'open';
    }

    isInProgress(): boolean {
        return this.status === 'in_progress';
    }

    isClosed(): boolean {
        return this.status === 'closed';
    }

    getStatusDisplayName(): string {
        const statusNames: Record<IssueStatus, string> = {
            open: 'Aberto',
            in_progress: 'Em Progresso',
            resolved: 'Resolvido',
            closed: 'Fechado'
        };
        return statusNames[this.status];
    }

    getPriorityDisplayName(): string {
        const priorityNames: Record<IssuePriority, string> = {
            low: 'Baixa',
            medium: 'Média',
            high: 'Alta',
            urgent: 'Urgente'
        };
        return priorityNames[this.priority];
    }

    getPriorityColor(): string {
        const priorityColors: Record<IssuePriority, string> = {
            low: '#10B981',    
            medium: '#F59E0B', 
            high: '#EF4444',  
            urgent: '#DC2626'  
        };
        return priorityColors[this.priority];
    }

    getStatusColor(): string {
        const statusColors: Record<IssueStatus, string> = {
            open: '#3B82F6',      
            in_progress: '#F59E0B', 
            resolved: '#10B981',   
            closed: '#6B7280'     
        };
        return statusColors[this.status];
    }

    getCreatedDate(): string {
        return this.createdAt?.toLocaleDateString('pt-BR') || '';
    }

    getUpdatedDate(): string {
        return this.updatedAt?.toLocaleDateString('pt-BR') || '';
    }

    getResolvedDate(): string {
        return this.resolvedAt?.toLocaleDateString('pt-BR') || '';
    }

    getTimeToResolution(): number | null {
        if (!this.resolvedAt || !this.createdAt) {
            return null;
        }
        return Math.floor((this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    }

    getAgeInDays(): number {
        if (!this.createdAt) return 0;
        const now = new Date();
        return Math.floor((now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    }

    isOverdue(): boolean {
        if (this.isResolved()) return false;
        
        const ageInDays = this.getAgeInDays();
        const priorityThresholds: Record<IssuePriority, number> = {
            low: 30,
            medium: 14,
            high: 7,
            urgent: 2
        };
        
        return ageInDays > priorityThresholds[this.priority];
    }

    getOverdueDays(): number {
        if (!this.isOverdue()) return 0;
        
        const ageInDays = this.getAgeInDays();
        const priorityThresholds: Record<IssuePriority, number> = {
            low: 30,
            medium: 14,
            high: 7,
            urgent: 2
        };
        
        return ageInDays - priorityThresholds[this.priority];
    }

    toPrisma(): any {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            category: this.category,
            reporterId: this.reporterId,
            assigneeId: this.assigneeId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            resolvedAt: this.resolvedAt
        };
    }

    toJSON(): any {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            category: this.category,
            reporterId: this.reporterId,
            assigneeId: this.assigneeId,
            createdAt: this.createdAt?.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
            resolvedAt: this.resolvedAt?.toISOString()
        };
    }
}
