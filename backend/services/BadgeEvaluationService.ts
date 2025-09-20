import { BadgeRepository, UserBadgeRepository } from "../repositories/BadgeRepository";
import { UserRepository } from "../repositories/UserRepository";
import { Badge } from "../models/Badge";
import { User } from "../models/user/User";

export interface BadgeCriteria {
  points?: number;
  tasks?: number;
  projects?: number;
  workSessions?: number;
  weeklyHours?: number;
  consecutiveDays?: number;
  specialCondition?: string;
}

export class BadgeEvaluationService {
  private badgeRepo: BadgeRepository;
  private userRepo: UserRepository;
  private userBadgeRepo: UserBadgeRepository;

  constructor() {
    this.badgeRepo = new BadgeRepository();
    this.userRepo = new UserRepository();
    this.userBadgeRepo = new UserBadgeRepository();
  }

  /**
   * Evaluate all users for potential badge awards
   */
  async evaluateAllUsers(): Promise<void> {
    try {
      const users = await this.userRepo.findAll();
      const activeBadges = await this.badgeRepo.findActive();

      for (const user of users) {
        await this.evaluateUserForBadges(user, activeBadges);
      }
    } catch (error) {
      console.error("Error evaluating users for badges:", error);
      throw error;
    }
  }

  /**
   * Evaluate a specific user for potential badge awards
   */
  async evaluateUserForBadges(user: User, badges?: Badge[]): Promise<Badge[]> {
    try {
      if (!badges) {
        badges = await this.badgeRepo.findActive();
      }

      const userBadges = await this.userBadgeRepo.findByUserId(user.id!);
      const earnedBadgeIds = userBadges.map(ub => ub.badgeId);
      
      const newlyEarnedBadges: Badge[] = [];

      for (const badge of badges) {
        // Skip if user already has this badge
        if (earnedBadgeIds.includes(badge.id!)) {
          continue;
        }

        // Check if user meets criteria
        if (await this.userMeetsCriteria(user, badge.criteria)) {
          try {
            await this.userBadgeRepo.create({
              userId: user.id!,
              badgeId: badge.id!,
              earnedBy: null // Auto-awarded by system
            });
            
            newlyEarnedBadges.push(badge);
            console.log(`Badge "${badge.name}" awarded to user ${user.name} (ID: ${user.id})`);
          } catch (error) {
            console.error(`Error awarding badge ${badge.id} to user ${user.id}:`, error);
          }
        }
      }

      return newlyEarnedBadges;
    } catch (error) {
      console.error(`Error evaluating user ${user.id} for badges:`, error);
      throw error;
    }
  }

  /**
   * Check if a user meets the criteria for a badge
   */
  private async userMeetsCriteria(user: User, criteria?: BadgeCriteria): Promise<boolean> {
    if (!criteria) return false;

    try {
      // Get user statistics
      const userStats = await this.getUserStatistics(user.id!);

      // Check each criterion
      if (criteria.points && userStats.points < criteria.points) {
        return false;
      }

      if (criteria.tasks && userStats.completedTasks < criteria.tasks) {
        return false;
      }

      if (criteria.projects && userStats.projectsCount < criteria.projects) {
        return false;
      }

      if (criteria.workSessions && userStats.workSessionsCount < criteria.workSessions) {
        return false;
      }

      if (criteria.weeklyHours && userStats.averageWeeklyHours < criteria.weeklyHours) {
        return false;
      }

      if (criteria.consecutiveDays && userStats.maxConsecutiveDays < criteria.consecutiveDays) {
        return false;
      }

      // Special conditions (custom logic)
      if (criteria.specialCondition) {
        if (!await this.evaluateSpecialCondition(user, criteria.specialCondition, userStats)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`Error checking criteria for user ${user.id}:`, error);
      return false;
    }
  }

  /**
   * Get comprehensive user statistics
   */
  private async getUserStatistics(userId: number): Promise<{
    points: number;
    completedTasks: number;
    projectsCount: number;
    workSessionsCount: number;
    averageWeeklyHours: number;
    maxConsecutiveDays: number;
  }> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Get additional statistics from related entities
      const projectsCount = await this.userRepo.getUserProjectsCount(userId);
      const workSessionsCount = await this.userRepo.getUserWorkSessionsCount(userId);
      const averageWeeklyHours = await this.userRepo.getUserAverageWeeklyHours(userId);
      const maxConsecutiveDays = await this.userRepo.getUserMaxConsecutiveDays(userId);

      return {
        points: user.points,
        completedTasks: user.completedTasks,
        projectsCount,
        workSessionsCount,
        averageWeeklyHours,
        maxConsecutiveDays
      };
    } catch (error) {
      console.error(`Error getting statistics for user ${userId}:`, error);
      return {
        points: 0,
        completedTasks: 0,
        projectsCount: 0,
        workSessionsCount: 0,
        averageWeeklyHours: 0,
        maxConsecutiveDays: 0
      };
    }
  }

  /**
   * Evaluate special conditions (custom logic for specific badges)
   */
  private async evaluateSpecialCondition(
    user: User, 
    condition: string, 
    stats: any
  ): Promise<boolean> {
    try {
      const conditionLower = condition.toLowerCase();

      // First user to reach milestones
      if (conditionLower.includes("primeiro") && conditionLower.includes("100")) {
        if (conditionLower.includes("tarefas") && stats.completedTasks >= 100) {
          // Check if this user is the first to reach 100 tasks
          const allUsers = await this.userRepo.findAll();
          const usersWith100Tasks = allUsers.filter(u => u.completedTasks >= 100);
          return usersWith100Tasks.length === 1 && usersWith100Tasks[0].id === user.id;
        }
        
        if (conditionLower.includes("pontos") && stats.points >= 100) {
          // Check if this user is the first to reach 100 points
          const allUsers = await this.userRepo.findAll();
          const usersWith100Points = allUsers.filter(u => u.points >= 100);
          return usersWith100Points.length === 1 && usersWith100Points[0].id === user.id;
        }
      }

      // Perfect week (completed all weekly hours)
      if (conditionLower.includes("semana perfeita")) {
        return stats.averageWeeklyHours >= user.weekHours;
      }

      // Streak achievements
      if (conditionLower.includes("sequência") && conditionLower.includes("dias")) {
        return stats.maxConsecutiveDays >= 7; // 7-day streak
      }

      // Role-specific achievements
      if (conditionLower.includes("coordenador") && user.hasRole("COORDENADOR")) {
        return true;
      }

      if (conditionLower.includes("gerente") && user.hasRole("GERENTE")) {
        return true;
      }

      // Default: return true for unrecognized conditions
      // This allows for manual badge awarding
      return true;
    } catch (error) {
      console.error(`Error evaluating special condition "${condition}" for user ${user.id}:`, error);
      return false;
    }
  }

  /**
   * Manually award a badge to a user (for special cases)
   */
  async manuallyAwardBadge(userId: number, badgeId: number, awardedBy: number): Promise<void> {
    try {
      // Check if user already has this badge
      const existingUserBadge = await this.userBadgeRepo.findByUserAndBadge(userId, badgeId);
      if (existingUserBadge) {
        throw new Error("User already has this badge");
      }

      // Create the user badge
      await this.userBadgeRepo.create({
        userId,
        badgeId,
        earnedBy: awardedBy
      });

      console.log(`Badge ${badgeId} manually awarded to user ${userId} by user ${awardedBy}`);
    } catch (error) {
      console.error(`Error manually awarding badge ${badgeId} to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a badge from a user
   */
  async removeBadgeFromUser(userId: number, badgeId: number): Promise<void> {
    try {
      await this.userBadgeRepo.deleteByUserAndBadge(userId, badgeId);
      console.log(`Badge ${badgeId} removed from user ${userId}`);
    } catch (error) {
      console.error(`Error removing badge ${badgeId} from user ${userId}:`, error);
      throw error;
    }
  }
}
