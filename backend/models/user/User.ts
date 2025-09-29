import { users, UserRole, ProfileVisibility } from '@prisma/client';
import { UserAuth } from './UserAuth';
import { UserProfile } from './UserProfile';
import { UserPoints } from './UserPoints';
import { UserRoles } from './UserRoles';
import { UserStatus } from './UserStatus';
import { UserHours } from './UserHours';
import { UserTimestamps } from './UserTimestamps';

export interface IUser {
    id?: number;
    name: string;
    email: string;
    points?: number;
    completedTasks?: number;
    password?: string | null;
    status?: string;
    weekHours?: number;
    createdAt?: Date;
    currentWeekHours?: number;
    profileVisibility?: ProfileVisibility;
    bio?: string | null;
    avatar?: string | null;
    roles?: UserRole[];
}

export abstract class User {
    public id?: number;
    private auth: UserAuth;
    private profile: UserProfile;
    private pointsManager: UserPoints;
    private rolesManager: UserRoles;
    private statusManager: UserStatus;
    private hoursManager: UserHours;
    private timestamps: UserTimestamps;

    constructor(data: IUser) {
        this.id = data.id;
        
        // Initialize components
        this.auth = new UserAuth(data.password || null);
        this.profile = new UserProfile(
            data.name,
            data.email,
            data.bio || null,
            data.avatar || null,
            data.profileVisibility || 'public'
        );
        this.pointsManager = new UserPoints(data.points || 0, data.completedTasks || 0);
        this.rolesManager = new UserRoles(data.roles || []);
        this.statusManager = new UserStatus(data.status || 'pending');
        this.hoursManager = new UserHours(data.weekHours || 0, data.currentWeekHours || 0);
        this.timestamps = new UserTimestamps(data.createdAt);
    }

    // Factory method to create appropriate role instance
    static create(data: Omit<IUser, 'id' | 'createdAt'>): User {
        const baseUser = new BaseUser({
            ...data,
            points: 0,
            completedTasks: 0,
            status: 'pending',
            weekHours: 0,
            currentWeekHours: 0,
            profileVisibility: 'public',
            roles: [],
            createdAt: new Date(),
        });

        // Return role-specific instance if roles are specified
        if (data.roles && data.roles.length > 0) {
            // Import UserFactory dynamically to avoid circular dependency
            const { UserFactory } = require('../UserFactory');
            return UserFactory.createFromRole(data.roles[0], baseUser);
        }

        return baseUser;
    }

    static fromPrisma(data: users): User {
        const baseUser = new BaseUser({
            id: data.id,
            name: data.name,
            email: data.email,
            points: data.points,
            completedTasks: data.completedTasks,
            password: data.password,
            status: data.status,
            weekHours: data.weekHours,
            createdAt: data.createdAt,
            currentWeekHours: data.currentWeekHours,
            profileVisibility: data.profileVisibility,
            bio: data.bio,
            avatar: data.avatar,
            roles: data.roles,
        });

        // Return role-specific instance if roles exist
        if (data.roles && data.roles.length > 0) {
            // Import UserFactory dynamically to avoid circular dependency
            const { UserFactory } = require('../UserFactory');
            return UserFactory.createFromRole(data.roles[0], baseUser);
        }

        return baseUser;
    }

    toPrisma(): Omit<users, 'id' | 'createdAt'> {
        return {
            name: this.profile.getName(),
            email: this.profile.getEmail(),
            points: this.pointsManager.getPoints(),
            completedTasks: this.pointsManager.getCompletedTasks(),
            password: this.auth.getPassword(),
            status: this.statusManager.getStatus(),
            weekHours: this.hoursManager.getWeekHours(),
            currentWeekHours: this.hoursManager.getCurrentWeekHours(),
            profileVisibility: this.profile.getProfileVisibility(),
            bio: this.profile.getBio(),
            avatar: this.profile.getAvatar(),
            roles: this.rolesManager.getRoles(),
        };
    }

    // Delegation methods to components
    // Authentication
    async setPassword(password: string): Promise<void> {
        return this.auth.setPassword(password);
    }

    async validatePassword(password: string): Promise<boolean> {
        return this.auth.validatePassword(password);
    }

    // Profile
    updateName(name: string): User {
        this.profile.updateName(name);
        return this;
    }

    updateEmail(email: string): User {
        this.profile.updateEmail(email);
        return this;
    }

    updateBio(bio: string | null): User {
        this.profile.updateBio(bio);
        return this;
    }

    updateAvatar(avatar: string | null): User {
        this.profile.updateAvatar(avatar);
        return this;
    }

    updateProfileVisibility(visibility: ProfileVisibility): User {
        this.profile.updateProfileVisibility(visibility);
        return this;
    }

    updateWeekHours(weekHours: number): User {
        this.hoursManager.setWeekHours(weekHours);
        return this;
    }

    updateStatus(status: string): User {
        this.statusManager.setStatus(status);
        return this;
    }

    // Roles
    addRole(role: UserRole): User {
        this.rolesManager.addRole(role);
        return this;
    }

    removeRole(role: UserRole): User {
        this.rolesManager.removeRole(role);
        return this;
    }

    hasRole(role: UserRole): boolean {
        return this.rolesManager.hasRole(role);
    }

    hasAnyRole(roles: UserRole[]): boolean {
        return this.rolesManager.hasAnyRole(roles);
    }

    hasAllRoles(roles: UserRole[]): boolean {
        return this.rolesManager.hasAllRoles(roles);
    }

    // Status
    approve(): User {
        this.statusManager.approve();
        return this;
    }

    reject(): User {
        this.statusManager.reject();
        return this;
    }

    suspend(): User {
        this.statusManager.suspend();
        return this;
    }

    activate(): User {
        this.statusManager.activate();
        return this;
    }

    deactivate(): User {
        this.statusManager.deactivate();
        return this;
    }

    // Points
    addPoints(points: number): User {
        this.pointsManager.addPoints(points);
        return this;
    }

    removePoints(points: number): User {
        this.pointsManager.removePoints(points);
        return this;
    }

    setPoints(points: number): User {
        this.pointsManager.setPoints(points);
        return this;
    }

    incrementCompletedTasks(): User {
        this.pointsManager.incrementCompletedTasks();
        return this;
    }

    setCompletedTasks(count: number): User {
        this.pointsManager.setCompletedTasks(count);
        return this;
    }

    // Hours
    addWeekHours(hours: number): User {
        this.hoursManager.addWeekHours(hours);
        return this;
    }

    setWeekHours(hours: number): User {
        this.hoursManager.setWeekHours(hours);
        return this;
    }

    setCurrentWeekHours(hours: number): User {
        this.hoursManager.setCurrentWeekHours(hours);
        return this;
    }

    resetCurrentWeekHours(): User {
        this.hoursManager.resetCurrentWeekHours();
        return this;
    }

    deductHours(hours: number): User {
        this.hoursManager.deductHours(hours);
        return this;
    }

    // Getters
    get name(): string { return this.profile.getName(); }
    get email(): string { return this.profile.getEmail(); }
    get points(): number { return this.pointsManager.getPoints(); }
    get completedTasks(): number { return this.pointsManager.getCompletedTasks(); }
    get status(): string { return this.statusManager.getStatus(); }
    get weekHours(): number { return this.hoursManager.getWeekHours(); }
    get currentWeekHours(): number { return this.hoursManager.getCurrentWeekHours(); }
    get profileVisibility(): ProfileVisibility { return this.profile.getProfileVisibility(); }
    get bio(): string | null { return this.profile.getBio(); }
    get avatar(): string | null { return this.profile.getAvatar(); }
    get roles(): UserRole[] { return this.rolesManager.getRoles(); }
    get createdAt(): Date | undefined { return this.timestamps.getCreatedAt(); }

    // Utility methods
    isValid(): boolean {
        return this.profile.isValid();
    }

    canLogin(): boolean {
        return this.statusManager.canLogin();
    }

    canBeApproved(): boolean {
        return this.statusManager.canBeApproved();
    }

    canBeRejected(): boolean {
        return this.statusManager.canBeRejected();
    }

    canBeSuspended(): boolean {
        return this.statusManager.canBeSuspended();
    }

    canBeActivated(): boolean {
        return this.statusManager.canBeActivated();
    }

    getDisplayName(): string {
        return this.profile.getDisplayName();
    }

    getInitials(): string {
        return this.profile.getInitials();
    }

    getAvatarUrl(): string | null {
        return this.profile.getAvatarUrl();
    }

    getJoinDate(): string {
        return this.timestamps.getJoinDate();
    }

    getJoinTimeAgo(): string {
        return this.timestamps.getJoinTimeAgo();
    }

    getStatusDisplayName(): string {
        return this.statusManager.getStatusDisplayName();
    }

    getStatusColor(): string {
        return this.statusManager.getStatusColor();
    }

    getPointsLevel(): string {
        return this.pointsManager.getPointsLevel();
    }

    getRoleDisplayName(): string {
        return this.rolesManager.getRoleDisplayName();
    }

    getRolePriority(): number {
        return this.rolesManager.getRolePriority();
    }

    getRoleColor(): string {
        return this.rolesManager.getRoleColor();
    }

    getRoleIcon(): string {
        return this.rolesManager.getRoleIcon();
    }

    canViewProfile(viewer: User): boolean {
        return this.profile.canViewProfile(viewer.roles);
    }

    // Security methods
    toSafeObject(): any {
        const { auth, ...safeUser } = this;
        return safeUser;
    }

    toPublicObject(): {
        id: number | undefined;
        name: string;
        email: string;
        points: number;
        completedTasks: number;
        status: string;
        weekHours: number;
        currentWeekHours: number;
        profileVisibility: ProfileVisibility;
        bio: string | null;
        avatar: string | null;
        roles: UserRole[];
        createdAt: Date | undefined;
    } {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            points: this.pointsManager.getPoints(),
            completedTasks: this.pointsManager.getCompletedTasks(),
            status: this.statusManager.getStatus(),
            weekHours: this.hoursManager.getWeekHours(),
            currentWeekHours: this.hoursManager.getCurrentWeekHours(),
            profileVisibility: this.profile.getProfileVisibility(),
            bio: this.profile.getBio(),
            avatar: this.profile.getAvatar(),
            roles: this.rolesManager.getRoles(),
            createdAt: this.createdAt,
        };
    }

    // JSON serialization method
    toJSON(): any {
        return this.toPublicObject();
    }

    // Abstract methods that must be implemented by role-specific classes
    abstract canManageUsers(): boolean;
    abstract canManageProjects(): boolean;
    abstract canManageTasks(): boolean;
    abstract canManageRewards(): boolean;
    abstract canManageLaboratory(): boolean;
    abstract canApproveUsers(): boolean;
    abstract canApprovePurchases(): boolean;
    abstract canCompletePublicTasks(): boolean;
    abstract canCreateIssues(): boolean;
    abstract canResolveIssues(): boolean;
    abstract canAwardBadges(): boolean;
    abstract getRoleSpecificPermissions(): string[];
}

// Base implementation for users without specific roles
export class BaseUser extends User {
    canManageUsers(): boolean { return false; }
    canManageProjects(): boolean { return false; }
    canManageTasks(): boolean { return false; }
    canManageRewards(): boolean { return false; }
    canManageLaboratory(): boolean { return false; }
    canApproveUsers(): boolean { return false; }
    canApprovePurchases(): boolean { return false; }
    canCompletePublicTasks(): boolean { return false; }
    canCreateIssues(): boolean { return this.canLogin(); }
    canResolveIssues(): boolean { return false; }
    canAwardBadges(): boolean { return false; }
    getRoleSpecificPermissions(): string[] { return ['create_issues']; }
}

// UserFactory is imported dynamically to avoid circular dependency
