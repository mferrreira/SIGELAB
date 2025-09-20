import { project_members, UserRole } from '@prisma/client';

export interface IProjectMembership {
    id?: number;
    projectId: number;
    userId: number;
    joinedAt?: Date;
    roles: UserRole[];
}

export class ProjectMembership {
    private _id?: number;
    private _projectId: number;
    private _userId: number;
    private _joinedAt: Date;
    private _roles: UserRole[];

    constructor(data: IProjectMembership) {
        this._id = data.id;
        this._projectId = data.projectId;
        this._userId = data.userId;
        this._joinedAt = data.joinedAt || new Date();
        this._roles = data.roles || [];
    }

    // Getters
    get id(): number | undefined {
        return this._id;
    }

    get projectId(): number {
        return this._projectId;
    }

    get userId(): number {
        return this._userId;
    }

    get joinedAt(): Date {
        return this._joinedAt;
    }

    get roles(): UserRole[] {
        return [...this._roles]; // Return a copy to prevent external modification
    }

    // Business Logic Methods
    addRole(role: UserRole): void {
        if (!this.isValidProjectRole(role)) {
            throw new Error(`Papel de projeto inválido: ${role}`);
        }
        if (!this._roles.includes(role)) {
            this._roles.push(role);
        }
    }

    removeRole(role: UserRole): void {
        this._roles = this._roles.filter(r => r !== role);
    }

    hasRole(role: UserRole): boolean {
        return this._roles.includes(role);
    }

    hasAnyRole(roles: UserRole[]): boolean {
        return roles.some(role => this._roles.includes(role));
    }

    setRoles(roles: UserRole[]): void {
        // Validate all roles
        for (const role of roles) {
            if (!this.isValidProjectRole(role)) {
                throw new Error(`Papel de projeto inválido: ${role}`);
            }
        }
        this._roles = [...roles];
    }

    isProjectManager(): boolean {
        return this.hasRole('GERENTE_PROJETO');
    }

    isCoordinator(): boolean {
        return this.hasRole('COORDENADOR');
    }

    isManager(): boolean {
        return this.hasRole('GERENTE');
    }

    isLaboratorist(): boolean {
        return this.hasRole('LABORATORISTA');
    }

    isResearcher(): boolean {
        return this.hasRole('PESQUISADOR');
    }

    isCollaborator(): boolean {
        return this.hasRole('COLABORADOR');
    }

    isVolunteer(): boolean {
        return this.hasRole('VOLUNTARIO');
    }

    canManageProject(): boolean {
        return this.hasAnyRole(['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO']);
    }

    canManageTasks(): boolean {
        return this.hasAnyRole(['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO', 'LABORATORISTA']);
    }

    canViewProject(): boolean {
        return this._roles.length > 0; // Any role can view
    }

    getDaysSinceJoined(): number {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this._joinedAt.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Validation Methods
    private isValidProjectRole(role: UserRole): boolean {
        const validProjectRoles: UserRole[] = [
            'COORDENADOR',
            'GERENTE',
            'LABORATORISTA',
            'PESQUISADOR',
            'GERENTE_PROJETO',
            'COLABORADOR',
            'VOLUNTARIO',
        ];
        return validProjectRoles.includes(role);
    }

    validate(): string[] {
        const errors: string[] = [];

        if (!this._projectId || this._projectId <= 0) {
            errors.push('ID do projeto é obrigatório');
        }

        if (!this._userId || this._userId <= 0) {
            errors.push('ID do usuário é obrigatório');
        }

        if (!this._roles || this._roles.length === 0) {
            errors.push('Pelo menos um papel deve ser atribuído');
        }

        for (const role of this._roles) {
            if (!this.isValidProjectRole(role)) {
                errors.push(`Papel de projeto inválido: ${role}`);
            }
        }

        return errors;
    }

    // Serialization
    toJSON(): any {
        return {
            id: this._id,
            projectId: this._projectId,
            userId: this._userId,
            joinedAt: this._joinedAt,
            roles: this._roles,
        };
    }

    // Static factory methods
    static fromPrisma(data: project_members): ProjectMembership {
        return new ProjectMembership({
            id: data.id,
            projectId: data.projectId,
            userId: data.userId,
            joinedAt: data.joinedAt,
            roles: data.roles,
        });
    }

    static create(data: Omit<IProjectMembership, 'id' | 'joinedAt'>): ProjectMembership {
        return new ProjectMembership({
            ...data,
            joinedAt: new Date(),
        });
    }
}

