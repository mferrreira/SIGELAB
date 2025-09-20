import { rewards } from '@prisma/client';

export interface IReward {
    id?: number;
    name: string;
    description?: string | null;
    price: number;
    available: boolean;
    categoryId?: number | null;
    stock?: number | null;
    imageUrl?: string | null;
}

export class Reward {
    public id?: number;
    public name: string;
    public description?: string | null;
    public price: number;
    public available: boolean;
    public categoryId?: number | null;
    public stock?: number | null;
    public imageUrl?: string | null;

    constructor(
        name: string,
        price: number,
        available: boolean = true,
        description?: string | null,
        categoryId?: number | null,
        stock?: number | null,
        imageUrl?: string | null,
        id?: number
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.available = available;
        this.categoryId = categoryId;
        this.stock = stock;
        this.imageUrl = imageUrl;
    }

    static fromPrisma(data: rewards): Reward {
        const reward = new Reward(
            data.name,
            data.price,
            data.available,
            data.description,
            null, // categoryId - not in schema
            null, // stock - not in schema
            null, // imageUrl - not in schema
            data.id
        );
        return reward;
    }

    toPrisma(): any {
        const data: any = {
            name: this.name,
            price: this.price,
            available: this.available
        };
        
        if (this.description !== undefined) {
            data.description = this.description;
        }
        if (this.categoryId !== undefined) {
            data.categoryId = this.categoryId;
        }
        if (this.stock !== undefined) {
            data.stock = this.stock;
        }
        if (this.imageUrl !== undefined) {
            data.imageUrl = this.imageUrl;
        }
        
        // Only include id for updates
        if (this.id !== undefined) {
            data.id = this.id;
        }
        
        return data;
    }

    static create(data: IReward): Reward {
        return new Reward(
            data.name,
            data.price,
            data.available,
            data.description,
            data.categoryId,
            data.stock,
            data.imageUrl,
            data.id
        );
    }

    // Business logic methods
    updatePrice(newPrice: number): Reward {
        if (newPrice < 0) {
            throw new Error("Preço não pode ser negativo");
        }
        this.price = newPrice;
        return this;
    }

    updateAvailability(available: boolean): Reward {
        this.available = available;
        return this;
    }

    updateDescription(description: string | null): Reward {
        this.description = description;
        return this;
    }

    updateName(name: string): Reward {
        if (!name.trim()) {
            throw new Error("Nome da recompensa é obrigatório");
        }
        this.name = name.trim();
        return this;
    }

    updateCategory(categoryId: number | null): Reward {
        this.categoryId = categoryId;
        return this;
    }

    updateStock(stock: number | null): Reward {
        if (stock !== null && stock < 0) {
            throw new Error("Estoque não pode ser negativo");
        }
        this.stock = stock;
        return this;
    }

    updateImageUrl(imageUrl: string | null): Reward {
        this.imageUrl = imageUrl;
        return this;
    }

    decreaseStock(amount: number = 1): Reward {
        if (this.stock === null) {
            // Unlimited stock
            return this;
        }
        if (this.stock! < amount) {
            throw new Error("Estoque insuficiente");
        }
        this.stock! -= amount;
        return this;
    }

    increaseStock(amount: number = 1): Reward {
        if (this.stock === null) {
            // Unlimited stock
            return this;
        }
        this.stock! += amount;
        return this;
    }

    // Validation methods
    isValid(): boolean {
        return !!(this.name && this.name.trim() && this.price >= 0);
    }

    isAffordable(userPoints: number): boolean {
        return userPoints >= this.price;
    }

    getFormattedPrice(): string {
        return `${this.price} pontos`;
    }

    // Stock management
    isInStock(): boolean {
        return this.stock === null || this.stock! > 0;
    }

    getStockStatus(): string {
        if (this.stock === null) {
            return "Estoque ilimitado";
        }
        if (this.stock === 0) {
            return "Fora de estoque";
        }
        return `${this.stock} unidades disponíveis`;
    }

    // Business rules
    canBePurchased(userPoints: number): boolean {
        return this.available && this.isAffordable(userPoints) && this.isInStock();
    }

    getPurchaseValidationMessage(userPoints: number): string {
        if (!this.available) {
            return "Esta recompensa não está disponível";
        }
        if (!this.isInStock()) {
            return "Esta recompensa está fora de estoque";
        }
        if (!this.isAffordable(userPoints)) {
            return `Pontos insuficientes. Você tem ${userPoints} pontos, mas precisa de ${this.price} pontos`;
        }
        return "Recompensa pode ser comprada";
    }
}
