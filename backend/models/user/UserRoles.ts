import { UserRole } from '@prisma/client';

export class UserRoles {
    constructor(private roles: UserRole[] = []) {}

    addRole(role: UserRole): void {
        if (!this.roles.includes(role)) {
            this.roles.push(role);
        }
    }

    removeRole(role: UserRole): void {
        this.roles = this.roles.filter(r => r !== role);
    }

    setRoles(roles: UserRole[]): void {
        this.roles = [...roles];
    }

    hasRole(role: UserRole): boolean {
        return this.roles.includes(role);
    }

    hasAnyRole(roles: UserRole[]): boolean {
        return roles.some(role => this.roles.includes(role));
    }

    hasAllRoles(roles: UserRole[]): boolean {
        return roles.every(role => this.roles.includes(role));
    }

    getRoles(): UserRole[] {
        return [...this.roles];
    }

    getPrimaryRole(): UserRole | null {
        const rolePriority: UserRole[] = [
            'COORDENADOR',
            'GERENTE',
            'LABORATORISTA',
            'GERENTE_PROJETO',
            'PESQUISADOR',
            'COLABORADOR',
            'VOLUNTARIO'
        ];

        for (const role of rolePriority) {
            if (this.roles.includes(role)) {
                return role;
            }
        }

        return null;
    }

    getRolePriority(): number {
        const primaryRole = this.getPrimaryRole();
        const priorities: Record<UserRole, number> = {
            'COORDENADOR': 1,
            'GERENTE': 2,
            'LABORATORISTA': 3,
            'GERENTE_PROJETO': 4,
            'PESQUISADOR': 5,
            'COLABORADOR': 6,
            'VOLUNTARIO': 7
        };
        return primaryRole ? priorities[primaryRole] : 8;
    }

    getRoleColor(): string {
        const primaryRole = this.getPrimaryRole();
        const colors: Record<UserRole, string> = {
            'COORDENADOR': '#DC2626', // Red
            'GERENTE': '#7C3AED',     // Purple
            'LABORATORISTA': '#059669', // Green
            'GERENTE_PROJETO': '#2563EB', // Blue
            'PESQUISADOR': '#0891B2',  // Cyan
            'COLABORADOR': '#EA580C',  // Orange
            'VOLUNTARIO': '#16A34A'    // Green
        };
        return primaryRole ? colors[primaryRole] : '#6B7280';
    }

    getRoleIcon(): string {
        const primaryRole = this.getPrimaryRole();
        const icons: Record<UserRole, string> = {
            'COORDENADOR': '👑',
            'GERENTE': '👔',
            'LABORATORISTA': '🔬',
            'GERENTE_PROJETO': '📋',
            'PESQUISADOR': '🔬',
            'COLABORADOR': '🤝',
            'VOLUNTARIO': '🙋‍♂️'
        };
        return primaryRole ? icons[primaryRole] : '👤';
    }

    getRoleDisplayName(): string {
        const primaryRole = this.getPrimaryRole();
        const displayNames: Record<UserRole, string> = {
            'COORDENADOR': 'Coordenador',
            'GERENTE': 'Gerente',
            'LABORATORISTA': 'Laboratorista',
            'GERENTE_PROJETO': 'Gerente de Projeto',
            'PESQUISADOR': 'Pesquisador',
            'COLABORADOR': 'Colaborador',
            'VOLUNTARIO': 'Voluntário'
        };
        return primaryRole ? displayNames[primaryRole] : 'Usuário';
    }
}

