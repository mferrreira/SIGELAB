import { ProfileVisibility } from '@prisma/client';

export class UserProfile {
    constructor(
        private name: string,
        private email: string,
        private bio: string | null = null,
        private avatar: string | null = null,
        private profileVisibility: ProfileVisibility = 'public'
    ) {}

    updateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error("Nome é obrigatório");
        }
        this.name = name.trim();
    }

    updateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error("Email inválido");
        }
        this.email = email.toLowerCase().trim();
    }

    updateBio(bio: string | null): void {
        this.bio = bio;
    }

    updateAvatar(avatar: string | null): void {
        this.avatar = avatar;
    }

    updateProfileVisibility(visibility: ProfileVisibility): void {
        const validVisibilities: ProfileVisibility[] = ['public', 'members_only', 'private'];
        if (!validVisibilities.includes(visibility)) {
            throw new Error("Visibilidade de perfil inválida");
        }
        this.profileVisibility = visibility;
    }

    // Getters
    getName(): string {
        return this.name;
    }

    getEmail(): string {
        return this.email;
    }

    getBio(): string | null {
        return this.bio;
    }

    getAvatar(): string | null {
        return this.avatar;
    }

    getProfileVisibility(): ProfileVisibility {
        return this.profileVisibility;
    }

    getDisplayName(): string {
        return this.name;
    }

    getInitials(): string {
        const names = this.name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return this.name.substring(0, 2).toUpperCase();
    }

    getAvatarUrl(): string | null {
        return this.avatar;
    }

    // Profile visibility methods
    isProfilePublic(): boolean {
        return this.profileVisibility === 'public';
    }

    isProfileMembersOnly(): boolean {
        return this.profileVisibility === 'members_only';
    }

    isProfilePrivate(): boolean {
        return this.profileVisibility === 'private';
    }

    canViewProfile(viewerRoles: string[]): boolean {
        if (this.isProfilePublic()) return true;
        if (this.isProfilePrivate()) return false; // Only owner can view
        if (this.isProfileMembersOnly()) {
            return viewerRoles.length > 0;
        }
        return false;
    }

    // Validation
    isValid(): boolean {
        return !!(
            this.name &&
            this.email &&
            this.name.trim().length > 0 &&
            this.email.trim().length > 0
        );
    }
}
