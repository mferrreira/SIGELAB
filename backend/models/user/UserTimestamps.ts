export class UserTimestamps {
    constructor(private createdAt?: Date) {}

    setCreatedAt(date: Date): void {
        this.createdAt = date;
    }

    getCreatedAt(): Date | undefined {
        return this.createdAt;
    }

    getJoinDate(): string {
        return this.createdAt?.toLocaleDateString('pt-BR') || '';
    }

    getJoinTimeAgo(): string {
        if (!this.createdAt) return '';
        
        const now = new Date();
        const diffInMs = now.getTime() - this.createdAt.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Hoje';
        if (diffInDays === 1) return 'Ontem';
        if (diffInDays < 7) return `${diffInDays} dias atrás`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;
        return `${Math.floor(diffInDays / 365)} anos atrás`;
    }

    getDaysSinceJoin(): number {
        if (!this.createdAt) return 0;
        const now = new Date();
        const diffInMs = now.getTime() - this.createdAt.getTime();
        return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    }
}

