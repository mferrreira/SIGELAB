import { User, BaseUser } from '../user/User';
import { UserRole } from '@prisma/client';

export class Gerente extends User {
    constructor(baseUser: BaseUser) {
        super(baseUser);
        // Ensure Gerente role is present
        if (!this.hasRole('GERENTE')) {
            this.addRole('GERENTE');
        }
    }

    getRoleDisplayName(): string {
        return 'Gerente';
    }

    // Gerente has management access but not full system control
    canManageUsers(): boolean {
        return true;
    }

    canManageProjects(): boolean {
        return true;
    }

    canManageTasks(): boolean {
        return true;
    }

    canManageRewards(): boolean {
        return true;
    }

    canManageLaboratory(): boolean {
        return false; // Only Coordenador and Laboratorista can manage laboratory
    }

    canApproveUsers(): boolean {
        return true;
    }

    canApprovePurchases(): boolean {
        return true;
    }

    canCompletePublicTasks(): boolean {
        return true;
    }

    canCreateIssues(): boolean {
        return true;
    }

    canResolveIssues(): boolean {
        return false; // Only Coordenador and Laboratorista can resolve issues
    }

    canAwardBadges(): boolean {
        return true;
    }

    getRoleSpecificPermissions(): string[] {
        return [
            'manage_users',
            'manage_projects',
            'manage_tasks',
            'manage_rewards',
            'approve_users',
            'approve_purchases',
            'complete_public_tasks',
            'create_issues',
            'award_badges',
            'view_management_dashboard',
            'manage_team_performance',
            'access_reports'
        ];
    }

    // Gerente-specific methods
    canViewManagementDashboard(): boolean {
        return true;
    }

    canManageTeamPerformance(): boolean {
        return true;
    }

    canAccessReports(): boolean {
        return true;
    }

    canManageProjectBudgets(): boolean {
        return true;
    }

    canAssignProjectManagers(): boolean {
        return true;
    }

    canViewFinancialReports(): boolean {
        return true;
    }

    getRolePriority(): number {
        return 2; // Second highest priority
    }

    getRoleColor(): string {
        return '#7C3AED'; // Purple
    }

    getRoleIcon(): string {
        return '👔';
    }
}
