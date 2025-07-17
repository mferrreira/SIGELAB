import { PrismaClient } from '@prisma/client'

// Query Optimizer for Database Performance
// This system provides query batching, caching, and optimization

interface QueryBatch<T> {
  queries: Array<() => Promise<T>>
  results: T[]
  pending: boolean
}

class QueryOptimizer {
  private prisma: PrismaClient
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private batches = new Map<string, QueryBatch<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // Batch multiple queries together
  async batchQueries<T>(
    queries: Array<() => Promise<T>>,
    batchKey: string
  ): Promise<T[]> {
    // Check if there's already a batch in progress
    const existingBatch = this.batches.get(batchKey)
    if (existingBatch && existingBatch.pending) {
      // Wait for existing batch to complete
      while (existingBatch.pending) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      return existingBatch.results
    }

    // Create new batch
    const batch: QueryBatch<T> = {
      queries,
      results: [],
      pending: true
    }

    this.batches.set(batchKey, batch)

    try {
      // Execute all queries in parallel
      const results = await Promise.all(queries.map(query => query()))
      batch.results = results
      return results
    } catch (error) {
      console.error('Batch query error:', error)
      throw error
    } finally {
      batch.pending = false
    }
  }

  // Cache query results
  async cachedQuery<T>(
    key: string,
    query: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }

    const result = await query()
    this.cache.set(key, {
      data: result,
      timestamp: Date.now(),
      ttl
    })

    return result
  }

  // Invalidate cache by pattern
  invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  // Optimized user queries with includes
  async getUsersWithDetails(userIds: number[]) {
    const cacheKey = `users_with_details_${userIds.sort().join('_')}`
    
    return this.cachedQuery(cacheKey, async () => {
      return this.prisma.user.findMany({
        where: { id: { in: userIds } },
        include: {
          tasks: true,
          projects: true,
          dailyLogs: true,
          workSessions: true,
          weeklyReports: true
        }
      })
    })
  }

  // Optimized task queries with user data
  async getTasksWithUsers(taskIds: number[]) {
    const cacheKey = `tasks_with_users_${taskIds.sort().join('_')}`
    
    return this.cachedQuery(cacheKey, async () => {
      return this.prisma.task.findMany({
        where: { id: { in: taskIds } },
        include: {
          assignedTo: true,
          createdBy: true,
          project: true
        }
      })
    })
  }

  // Optimized project queries with members
  async getProjectsWithMembers(projectIds: number[]) {
    const cacheKey = `projects_with_members_${projectIds.sort().join('_')}`
    
    return this.cachedQuery(cacheKey, async () => {
      return this.prisma.project.findMany({
        where: { id: { in: projectIds } },
        include: {
          members: true,
          tasks: true,
          createdBy: true
        }
      })
    })
  }

  // Bulk operations for better performance
  async bulkCreateTasks(tasks: any[]) {
    return this.prisma.task.createMany({
      data: tasks,
      skipDuplicates: true
    })
  }

  async bulkUpdateTasks(updates: Array<{ id: number; data: any }>) {
    const batchQueries = updates.map(({ id, data }) =>
      () => this.prisma.task.update({ where: { id }, data })
    )

    return this.batchQueries(batchQueries, `bulk_update_tasks_${Date.now()}`)
  }

  async bulkDeleteTasks(taskIds: number[]) {
    return this.prisma.task.deleteMany({
      where: { id: { in: taskIds } }
    })
  }

  // Optimized statistics queries
  async getDashboardStats(userId: number) {
    const cacheKey = `dashboard_stats_${userId}`
    
    return this.cachedQuery(cacheKey, async () => {
      const [
        totalTasks,
        completedTasks,
        pendingTasks,
        totalProjects,
        totalHours,
        weeklyHours
      ] = await Promise.all([
        this.prisma.task.count({ where: { assignedToId: userId } }),
        this.prisma.task.count({ 
          where: { 
            assignedToId: userId, 
            status: 'done' 
          } 
        }),
        this.prisma.task.count({ 
          where: { 
            assignedToId: userId, 
            status: { not: 'done' } 
          } 
        }),
        this.prisma.project.count({
          where: { members: { some: { userId } } }
        }),
        this.prisma.workSession.aggregate({
          where: { userId },
          _sum: { duration: true }
        }),
        this.prisma.weeklyReport.findFirst({
          where: { userId },
          orderBy: { weekStart: 'desc' }
        })
      ])

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        totalProjects,
        totalHours: totalHours._sum.duration || 0,
        weeklyHours: weeklyHours?.totalHours || 0
      }
    }, 2 * 60 * 1000) // 2 minutes cache
  }

  // Optimized search queries
  async searchTasks(query: string, userId: number) {
    const cacheKey = `search_tasks_${userId}_${query}`
    
    return this.cachedQuery(cacheKey, async () => {
      return this.prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          assignedToId: userId
        },
        include: {
          assignedTo: true,
          project: true
        },
        take: 20
      })
    }, 60 * 1000) // 1 minute cache
  }

  // Cleanup expired cache entries
  cleanupCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Create global query optimizer instance
export const queryOptimizer = new QueryOptimizer(new PrismaClient())

// Utility functions for common optimized queries
export const OptimizedQueries = {
  // Get user with all related data in one query
  getUserWithAllData: (userId: number) => {
    const cacheKey = `user_all_data_${userId}`
    return queryOptimizer.cachedQuery(cacheKey, async () => {
      return queryOptimizer.prisma.user.findUnique({
        where: { id: userId },
        include: {
          tasks: {
            include: {
              project: true,
              assignedTo: true
            }
          },
          projects: {
            include: {
              members: true,
              tasks: true
            }
          },
          dailyLogs: true,
          workSessions: true,
          weeklyReports: true,
          responsibilities: true
        }
      })
    })
  },

  // Get tasks for a user with all related data
  getUserTasks: (userId: number) => {
    const cacheKey = `user_tasks_${userId}`
    return queryOptimizer.cachedQuery(cacheKey, async () => {
      return queryOptimizer.prisma.task.findMany({
        where: { assignedToId: userId },
        include: {
          project: true,
          assignedTo: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }, 30 * 1000) // 30 seconds cache
  },

  // Get project with all members and tasks
  getProjectWithDetails: (projectId: number) => {
    const cacheKey = `project_details_${projectId}`
    return queryOptimizer.cachedQuery(cacheKey, async () => {
      return queryOptimizer.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            include: {
              user: true
            }
          },
          tasks: {
            include: {
              assignedTo: true,
              createdBy: true
            }
          },
          createdBy: true
        }
      })
    })
  }
} 