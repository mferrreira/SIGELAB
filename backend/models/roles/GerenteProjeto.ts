import { User, BaseUser } from '../user/User';
import { UserRole } from '@prisma/client';

export class GerenteProjeto extends User {
    constructor(baseUser: BaseUser) {
        super(baseUser);
        // Ensure GerenteProjeto role is present
        if (!this.hasRole('GERENTE_PROJETO')) {
            this.addRole('GERENTE_PROJETO');
        }
    }

    getRoleDisplayName(): string {
        return 'Gerente de Projeto';
    }

    // GerenteProjeto has project management capabilities
    canManageUsers(): boolean {
        return false;
    }

    canManageProjects(): boolean {
        return true;
    }

    canManageTasks(): boolean {
        return true;
    }

    canManageRewards(): boolean {
        return false;
    }

    canManageLaboratory(): boolean {
        return false;
    }

    canApproveUsers(): boolean {
        return false;
    }

    canApprovePurchases(): boolean {
        return false;
    }

    canCompletePublicTasks(): boolean {
        return true;
    }

    canCreateIssues(): boolean {
        return true;
    }

    canResolveIssues(): boolean {
        return false;
    }

    canAwardBadges(): boolean {
        return false;
    }

    getRoleSpecificPermissions(): string[] {
        return [
            'manage_projects',
            'manage_tasks',
            'complete_public_tasks',
            'create_issues',
            'assign_tasks',
            'manage_project_members',
            'view_project_reports',
            'manage_project_timeline',
            'approve_project_deliverables'
        ];
    }

    // GerenteProjeto-specific methods
    canAssignTasks(): boolean {
        return true;
    }

    canManageProjectMembers(): boolean {
        return true;
    }

    canViewProjectReports(): boolean {
        return true;
    }

    canManageProjectTimeline(): boolean {
        return true;
    }

    canApproveProjectDeliverables(): boolean {
        return true;
    }

    canManageProjectBudget(): boolean {
        return true;
    }

    canCreateProjectMilestones(): boolean {
        return true;
    }

    canManageProjectResources(): boolean {
        return true;
    }

    canViewProjectAnalytics(): boolean {
        return true;
    }

    getRolePriority(): number {
        return 4; // Fourth priority
    }

    getRoleColor(): string {
        return '#2563EB'; // Blue
    }

    getRoleIcon(): string {
        return '📋';
    }
}
