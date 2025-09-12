import { categories } from '@prisma/client';

export interface ICategory {
    id?: number;
    name: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    active: boolean;
}

export class Category {
    public id?: number;
    public name: string;
    public description?: string | null;
    public color?: string | null;
    public icon?: string | null;
    public active: boolean;

    constructor(
        name: string,
        active: boolean = true,
        description?: string | null,
        color?: string | null,
        icon?: string | null,
        id?: number
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.color = color;
        this.icon = icon;
        this.active = active;
    }

    static fromPrisma(data: categories): Category {
        const category = new Category(
            data.name,
            data.active,
            data.description,
            data.color,
            data.icon,
            data.id
        );
        return category;
    }

    toPrisma(): any {
        const data: any = {
            name: this.name,
            active: this.active
        };
        
        if (this.description !== undefined) {
            data.description = this.description;
        }
        if (this.color !== undefined) {
            data.color = this.color;
        }
        if (this.icon !== undefined) {
            data.icon = this.icon;
        }
        
        // Only include id for updates
        if (this.id !== undefined) {
            data.id = this.id;
        }
        
        return data;
    }

    static create(data: ICategory): Category {
        return new Category(
            data.name,
            data.active,
            data.description,
            data.color,
            data.icon,
            data.id
        );
    }

    // Business logic methods
    updateName(name: string): Category {
        if (!name.trim()) {
            throw new Error("Nome da categoria é obrigatório");
        }
        this.name = name.trim();
        return this;
    }

    updateDescription(description: string | null): Category {
        this.description = description;
        return this;
    }

    updateColor(color: string | null): Category {
        this.color = color;
        return this;
    }

    updateIcon(icon: string | null): Category {
        this.icon = icon;
        return this;
    }

    toggleActive(): Category {
        this.active = !this.active;
        return this;
    }

    activate(): Category {
        this.active = true;
        return this;
    }

    deactivate(): Category {
        this.active = false;
        return this;
    }

    // Validation methods
    isValid(): boolean {
        return !!(this.name && this.name.trim());
    }

    isActive(): boolean {
        return this.active;
    }

    // Utility methods
    getDisplayName(): string {
        return this.name;
    }

    getColorOrDefault(): string {
        return this.color || '#6B7280'; // Default gray color
    }

    getIconOrDefault(): string {
        return this.icon || '📦'; // Default package icon
    }

    // Business rules
    canBeDeleted(): boolean {
        // Categories can be deleted if they're not being used by rewards
        // This would need to be checked in the service layer
        return true;
    }

    getFormattedInfo(): string {
        return `${this.getIconOrDefault()} ${this.name}${this.description ? ` - ${this.description}` : ''}`;
    }
}

