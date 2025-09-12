import { purchases } from '@prisma/client';

export interface IPurchase {
    id?: number;
    userId: number;
    rewardId: number;
    rewardName: string;
    price: number;
    purchaseDate: Date;
    status: PurchaseStatus;
}

export type PurchaseStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export class Purchase {
    public id?: number;
    public userId: number;
    public rewardId: number;
    public rewardName: string;
    public price: number;
    public purchaseDate: Date;
    public status: PurchaseStatus;

    constructor(
        userId: number,
        rewardId: number,
        rewardName: string,
        price: number,
        purchaseDate: Date,
        status: PurchaseStatus = 'pending',
        id?: number
    ) {
        this.id = id;
        this.userId = userId;
        this.rewardId = rewardId;
        this.rewardName = rewardName;
        this.price = price;
        this.purchaseDate = purchaseDate;
        this.status = status;
    }

    static fromPrisma(data: purchases): Purchase {
        const purchase = new Purchase(
            data.userId,
            data.rewardId,
            data.rewardName,
            data.price,
            new Date(data.purchaseDate),
            data.status as PurchaseStatus,
            data.id
        );
        return purchase;
    }

    toPrisma(): any {
        const data: any = {
            userId: this.userId,
            rewardId: this.rewardId,
            rewardName: this.rewardName,
            price: this.price,
            purchaseDate: this.purchaseDate.toISOString(),
            status: this.status
        };
        
        if (this.id !== undefined) {
            data.id = this.id;
        }
        
        return data;
    }

    static create(data: IPurchase): Purchase {
        return new Purchase(
            data.userId,
            data.rewardId,
            data.rewardName,
            data.price,
            data.purchaseDate,
            data.status,
            data.id
        );
    }

    // Business logic methods
    approve(): Purchase {
        if (this.status !== 'pending') {
            throw new Error("Apenas compras pendentes podem ser aprovadas");
        }
        this.status = 'approved';
        return this;
    }

    reject(): Purchase {
        if (this.status !== 'pending') {
            throw new Error("Apenas compras pendentes podem ser rejeitadas");
        }
        this.status = 'rejected';
        return this;
    }

    complete(): Purchase {
        if (this.status !== 'approved') {
            throw new Error("Apenas compras aprovadas podem ser completadas");
        }
        this.status = 'completed';
        return this;
    }

    cancel(): Purchase {
        if (this.status === 'completed') {
            throw new Error("Compras completadas não podem ser canceladas");
        }
        this.status = 'cancelled';
        return this;
    }

    isValid(): boolean {
        return !!(this.userId && this.rewardId && this.rewardName && this.price >= 0);
    }

    isPending(): boolean {
        return this.status === 'pending';
    }

    isApproved(): boolean {
        return this.status === 'approved';
    }

    isCompleted(): boolean {
        return this.status === 'completed';
    }

    isRejected(): boolean {
        return this.status === 'rejected';
    }

    isCancelled(): boolean {
        return this.status === 'cancelled';
    }

    canBeApproved(): boolean {
        return this.status === 'pending';
    }

    canBeRejected(): boolean {
        return this.status === 'pending';
    }

    canBeCompleted(): boolean {
        return this.status === 'approved';
    }

    canBeCancelled(): boolean {
        return this.status !== 'completed';
    }

    getFormattedDate(): string {
        return this.purchaseDate.toLocaleDateString('pt-BR');
    }

    getFormattedPrice(): string {
        return `${this.price} pontos`;
    }

    getStatusDisplayName(): string {
        const statusMap = {
            'pending': 'Pendente',
            'approved': 'Aprovada',
            'rejected': 'Rejeitada',
            'completed': 'Completada',
            'cancelled': 'Cancelada'
        };
        return statusMap[this.status] || this.status;
    }

    getStatusColor(): string {
        const colorMap = {
            'pending': 'yellow',
            'approved': 'green',
            'rejected': 'red',
            'completed': 'blue',
            'cancelled': 'gray'
        };
        return colorMap[this.status] || 'gray';
    }

    shouldRefundPoints(): boolean {
        return this.status === 'rejected' || this.status === 'cancelled';
    }

    getRefundAmount(): number {
        return this.shouldRefundPoints() ? this.price : 0;
    }
}

