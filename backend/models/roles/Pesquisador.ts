import { User, BaseUser } from '../user/User';
import { UserRole } from '@prisma/client';

export class Pesquisador extends User {
    constructor(baseUser: BaseUser) {
        super(baseUser);
        // Ensure Pesquisador role is present
        if (!this.hasRole('PESQUISADOR')) {
            this.addRole('PESQUISADOR');
        }
    }

    getRoleDisplayName(): string {
        return 'Pesquisador';
    }

    // Pesquisador has research-focused capabilities
    canManageUsers(): boolean {
        return false;
    }

    canManageProjects(): boolean {
        return false;
    }

    canManageTasks(): boolean {
        return false;
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
            'complete_public_tasks',
            'create_issues',
            'access_research_data',
            'create_research_projects',
            'manage_research_documents',
            'view_research_analytics',
            'collaborate_on_projects',
            'access_lab_equipment'
        ];
    }

    // Pesquisador-specific methods
    canAccessResearchData(): boolean {
        return true;
    }

    canCreateResearchProjects(): boolean {
        return true;
    }

    canManageResearchDocuments(): boolean {
        return true;
    }

    canViewResearchAnalytics(): boolean {
        return true;
    }

    canCollaborateOnProjects(): boolean {
        return true;
    }

    canAccessLabEquipment(): boolean {
        return true;
    }

    canPublishResearch(): boolean {
        return true;
    }

    canManageResearchTimeline(): boolean {
        return true;
    }

    canViewResearchReports(): boolean {
        return true;
    }

    getRolePriority(): number {
        return 5; // Fifth priority
    }

    getRoleColor(): string {
        return '#0891B2'; // Cyan
    }

    getRoleIcon(): string {
        return '🔬';
    }
}
