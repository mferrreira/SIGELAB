export class UserStatus {
    constructor(private status: string = 'pending') {}

    approve(): void {
        this.status = 'active';
    }

    reject(): void {
        this.status = 'rejected';
    }

    suspend(): void {
        this.status = 'suspended';
    }

    activate(): void {
        this.status = 'active';
    }

    deactivate(): void {
        this.status = 'inactive';
    }

    setStatus(status: string): void {
        this.status = status;
    }

    getStatus(): string {
        return this.status;
    }

    isActive(): boolean {
        return this.status === 'active';
    }

    isPending(): boolean {
        return this.status === 'pending';
    }

    isRejected(): boolean {
        return this.status === 'rejected';
    }

    isSuspended(): boolean {
        return this.status === 'suspended';
    }

    isInactive(): boolean {
        return this.status === 'inactive';
    }

    canLogin(): boolean {
        return this.isActive();
    }

    canBeApproved(): boolean {
        return this.isPending();
    }

    canBeRejected(): boolean {
        return this.isPending();
    }

    canBeSuspended(): boolean {
        return this.isActive();
    }

    canBeActivated(): boolean {
        return this.status === 'inactive' || this.status === 'suspended';
    }

    getStatusDisplayName(): string {
        const statusNames: Record<string, string> = {
            'pending': 'Pendente',
            'active': 'Ativo',
            'rejected': 'Rejeitado',
            'suspended': 'Suspenso',
            'inactive': 'Inativo'
        };
        return statusNames[this.status] || 'Desconhecido';
    }

    getStatusColor(): string {
        const statusColors: Record<string, string> = {
            'pending': '#F59E0B',    // Yellow
            'active': '#10B981',     // Green
            'rejected': '#EF4444',   // Red
            'suspended': '#DC2626',  // Dark Red
            'inactive': '#6B7280'    // Gray
        };
        return statusColors[this.status] || '#6B7280';
    }
}

