import { projects, UserRole } from '@prisma/client';

export interface IProject {
    id?: number;
    name: string;
    description?: string | null;
    createdAt: string;
    createdBy: number;
    leaderId?: number | null;
    status: ProjectStatus;
    links?: ProjectLink[] | null;
}

export interface ProjectLink {
    label: string;
    url: string;
}

export enum ProjectStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    ARCHIVED = 'archived',
    ON_HOLD = 'on_hold'
}

export class Project {
    private _id?: number;
    private _name: string;
    private _description?: string | null;
    private _createdAt: string;
    private _createdBy: number;
    private _leaderId?: number | null;
    private _status: ProjectStatus;
    private _links?: ProjectLink[] | null;

    constructor(data: IProject) {
        this._id = data.id;
        this._name = data.name;
        this._description = data.description;
        this._createdAt = data.createdAt;
        this._createdBy = data.createdBy;
        this._leaderId = data.leaderId;
        this._status = data.status;
        this._links = data.links;
    }

    // Getters
    get id(): number | undefined {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get description(): string | null {
        return this._description || null;
    }

    get createdAt(): string {
        return this._createdAt;
    }

    get createdBy(): number {
        return this._createdBy;
    }

    get leaderId(): number | null {
        return this._leaderId || null;
    }

    get status(): ProjectStatus {
        return this._status;
    }

    get links(): ProjectLink[] {
        return this._links || [];
    }

    updateName(newName: string): void {
        if (!newName || newName.trim().length === 0) {
            throw new Error('Nome do projeto não pode estar vazio');
        }
        if (newName.length > 100) {
            throw new Error('Nome do projeto não pode ter mais de 100 caracteres');
        }
        this._name = newName.trim();
    }

    updateDescription(description: string | null): void {
        if (description && description.length > 500) {
            throw new Error('Descrição do projeto não pode ter mais de 500 caracteres');
        }
        this._description = description;
    }

    updateStatus(newStatus: ProjectStatus): void {
        if (!Object.values(ProjectStatus).includes(newStatus)) {
            throw new Error('Status do projeto inválido');
        }
        this._status = newStatus;
    }

    updateLeader(leaderId: number | null): void {
        if (leaderId !== null && leaderId <= 0) {
            throw new Error('ID do líder deve ser um número positivo');
        }
        this._leaderId = leaderId;
    }

    updateLinks(links: ProjectLink[]): void {
        for (const link of links) {
            if (!link.label || link.label.trim().length === 0) {
                throw new Error('Label do link não pode estar vazio');
            }
            if (link.label.length > 50) {
                throw new Error('Label do link não pode ter mais de 50 caracteres');
            }
            if (!link.url || link.url.trim().length === 0) {
                throw new Error('URL do link não pode estar vazia');
            }
            if (link.url.length > 500) {
                throw new Error('URL do link não pode ter mais de 500 caracteres');
            }
            const cleanUrl = this.cleanUrl(link.url);
            if (!this.isValidUrl(cleanUrl)) {
                throw new Error(`URL inválida para o link: ${link.label}`);
            }
        }
        this._links = links;
    }

    addLink(label: string, url: string): void {
        if (!label || !url) {
            throw new Error('Label e URL são obrigatórios para adicionar um link');
        }
        if (label.length > 50) {
            throw new Error('Label do link não pode ter mais de 50 caracteres');
        }
        if (url.length > 500) {
            throw new Error('URL não pode ter mais de 500 caracteres');
        }
        
        const cleanUrl = this.cleanUrl(url);
        if (!this.isValidUrl(cleanUrl)) {
            throw new Error('URL inválida');
        }

        const links = this._links || [];
        if (links.some(link => link.label === label)) {
            throw new Error('Já existe um link com este label');
        }

        links.push({ label, url: cleanUrl });
        this._links = links;
    }

    removeLink(label: string): void {
        if (!this._links) return;
        this._links = this._links.filter(link => link.label !== label);
    }

    updateLink(oldLabel: string, newLabel: string, newUrl: string): void {
        if (!oldLabel || !newLabel || !newUrl) {
            throw new Error('Label antigo, novo label e URL são obrigatórios');
        }
        if (newLabel.length > 50) {
            throw new Error('Label do link não pode ter mais de 50 caracteres');
        }
        if (newUrl.length > 500) {
            throw new Error('URL não pode ter mais de 500 caracteres');
        }
        
        const cleanUrl = this.cleanUrl(newUrl);
        if (!this.isValidUrl(cleanUrl)) {
            throw new Error('URL inválida');
        }

        const links = this._links || [];
        const linkIndex = links.findIndex(link => link.label === oldLabel);
        if (linkIndex === -1) {
            throw new Error('Link não encontrado');
        }
// Check if new label already exists (excluding the current one)
        if (links.some((link, index) => link.label === newLabel && index !== linkIndex)) {
            throw new Error('Já existe um link com este label');
        }

        links[linkIndex] = { label: newLabel, url: cleanUrl };
        this._links = links;
    }

    isActive(): boolean {
        return this._status === ProjectStatus.ACTIVE;
    }

    isCompleted(): boolean {
        return this._status === ProjectStatus.COMPLETED;
    }

    isArchived(): boolean {
        return this._status === ProjectStatus.ARCHIVED;
    }

    canBeModified(): boolean {
        return this._status === ProjectStatus.ACTIVE || this._status === ProjectStatus.ON_HOLD;
    }

    canBeDeleted(): boolean {
        return this._status === ProjectStatus.ARCHIVED;
    }

    getDaysSinceCreation(): number {
        const createdDate = new Date(this._createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            try {
                new URL('https://' + url);
                return true;
            } catch {
                return false;
            }
        }
    }

    private cleanUrl(url: string): string {
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
        }
        return cleanUrl;
    }

    validate(): string[] {
        const errors: string[] = [];

        if (!this._name || this._name.trim().length === 0) {
            errors.push('Nome do projeto é obrigatório');
        } else if (this._name.length > 100) {
            errors.push('Nome do projeto não pode ter mais de 100 caracteres');
        }

        if (this._description && this._description.length > 500) {
            errors.push('Descrição do projeto não pode ter mais de 500 caracteres');
        }

        if (!this._createdBy || this._createdBy <= 0) {
            errors.push('ID do criador do projeto é obrigatório');
        }

        if (!Object.values(ProjectStatus).includes(this._status)) {
            errors.push('Status do projeto inválido');
        }

        if (this._links) {
            for (const link of this._links) {
                if (!link.label || link.label.length > 50) {
                    errors.push('Label do link inválido');
                }
                if (link.url && link.url.length > 500) {
                    errors.push(`URL muito longa para o link: ${link.label}`);
                }
                if (!this.isValidUrl(link.url)) {
                    errors.push(`URL inválida para o link: ${link.label}`);
                }
            }
        }

        return errors;
    }

    toJSON(): any {
        const result = {
            id: this._id,
            name: this._name,
            description: this._description,
            createdAt: this._createdAt,
            createdBy: this._createdBy,
            leaderId: this._leaderId,
            status: this._status,
            links: this._links,
        };
        
        console.log('Project.toJSON - serializing links:', this._links);
        console.log('Project.toJSON - final result:', result);
        
        return result;
    }

    static fromPrisma(data: projects): Project {
        console.log('Project.fromPrisma - raw data.links:', data.links);
        console.log('Project.fromPrisma - data.links type:', typeof data.links);
        
        const project = new Project({
            id: data.id,
            name: data.name,
            description: data.description,
            createdAt: data.createdAt,
            createdBy: data.createdBy,
            leaderId: data.leaderId,
            status: data.status as ProjectStatus,
            links: data.links ? (data.links as unknown as ProjectLink[]) : null,
        });
        
        console.log('Project.fromPrisma - converted project links:', project.links);
        return project;
    }

    static create(data: Omit<IProject, 'id' | 'createdAt'>): Project {
        console.log('Project.create - input data:', data);
        console.log('Project.create - data.links:', data.links);
        
        const now = new Date().toISOString();
        const project = new Project({
            ...data,
            createdAt: now,
        });
        
        console.log('Project.create - created project links:', project.links);
        return project;
    }
}
