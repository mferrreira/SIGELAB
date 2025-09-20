import { User, BaseUser } from '../user/User';
import { UserRole } from '@prisma/client';

export class Colaborador extends User {
    constructor(baseUser: BaseUser) {
        super(baseUser);
        // Ensure Colaborador role is present
        if (!this.hasRole('COLABORADOR')) {
            this.addRole('COLABORADOR');
        }
    }

    getRoleDisplayName(): string {
        return 'Colaborador';
    }

    // Colaborador has task management and collaboration capabilities
    canManageUsers(): boolean {
        return false;
    }

    canManageProjects(): boolean {
        return false;
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
            'manage_tasks',
            'complete_public_tasks',
            'create_issues',
            'assign_tasks_to_volunteers',
            'collaborate_on_projects',
            'view_project_progress',
            'manage_team_communication',
            'access_collaboration_tools'
        ];
    }

    // Colaborador-specific methods
    canAssignTasksToVolunteers(): boolean {
        return true;
    }

    canCollaborateOnProjects(): boolean {
        return true;
    }

    canViewProjectProgress(): boolean {
        return true;
    }

    canManageTeamCommunication(): boolean {
        return true;
    }

    canAccessCollaborationTools(): boolean {
        return true;
    }

    canCreateTaskTemplates(): boolean {
        return true;
    }

    canManageTaskPriorities(): boolean {
        return true;
    }

    canViewTeamPerformance(): boolean {
        return true;
    }

    canCoordinateTeamEfforts(): boolean {
        return true;
    }

    getRolePriority(): number {
        return 6; // Sixth priority
    }

    getRoleColor(): string {
        return '#EA580C'; // Orange
    }

    getRoleIcon(): string {
        return '🤝';
    }
}
