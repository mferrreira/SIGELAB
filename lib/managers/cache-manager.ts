// Cache Manager for Performance Optimization
// This system provides in-memory caching with TTL (Time To Live) and automatic invalidation

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number // Default TTL in milliseconds (5 minutes)
  maxSize?: number // Maximum number of entries in cache
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes
  private maxSize = 100 // Maximum cache entries

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL
    this.maxSize = options.maxSize || this.maxSize
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  // Set a value in cache
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }

    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, entry)
  }

  // Get a value from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    
    if (!entry) {
      return null
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  // Check if a key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Remove a specific key from cache
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache size
  size(): number {
    return this.cache.size
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Invalidate cache by pattern (useful for related data)
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      defaultTTL: this.defaultTTL
    }
  }
}

// Cache keys generator for consistent naming
export const CacheKeys = {
  // User-related cache keys
  USERS: 'users',
  USER: (id: number) => `user:${id}`,
  
  // Task-related cache keys
  TASKS: 'tasks',
  TASK: (id: number) => `task:${id}`,
  USER_TASKS: (userId: number) => `user_tasks:${userId}`,
  
  // Project-related cache keys
  PROJECTS: 'projects',
  PROJECT: (id: number) => `project:${id}`,
  PROJECT_MEMBERS: (projectId: number) => `project_members:${projectId}`,
  
  // Reward-related cache keys
  REWARDS: 'rewards',
  REWARD: (id: number) => `reward:${id}`,
  PURCHASES: 'purchases',
  
  // Laboratory-related cache keys
  LAB_SCHEDULES: 'lab_schedules',
  LAB_RESPONSIBILITIES: 'lab_responsibilities',
  ACTIVE_RESPONSIBILITY: 'active_responsibility',
  LAB_EVENTS: 'lab_events',
  
  // Daily logs cache keys
  DAILY_LOGS: 'daily_logs',
  USER_LOGS: (userId: number) => `user_logs:${userId}`,
  
  // Weekly reports cache keys
  WEEKLY_REPORTS: 'weekly_reports',
  USER_WEEKLY_REPORTS: (userId: number) => `user_weekly_reports:${userId}`,
  
  // Work sessions cache keys
  WORK_SESSIONS: 'work_sessions',
  USER_SESSIONS: (userId: number) => `user_sessions:${userId}`,
  
  // User schedules cache keys
  USER_SCHEDULES: 'user_schedules',
  USER_SCHEDULE: (userId: number) => `user_schedule:${userId}`,
} as const

// TTL presets for different types of data
export const CacheTTL = {
  // Short-lived data (frequently changing)
  SHORT: 30 * 1000, // 30 seconds
  
  // Medium-lived data (moderately changing)
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  
  // Long-lived data (rarely changing)
  LONG: 30 * 60 * 1000, // 30 minutes
  
  // Very long-lived data (almost static)
  VERY_LONG: 2 * 60 * 60 * 1000, // 2 hours
  
  // User-specific data (depends on user activity)
  USER_SPECIFIC: 2 * 60 * 1000, // 2 minutes
} as const

// Create global cache instance
export const globalCache = new CacheManager({
  ttl: CacheTTL.MEDIUM,
  maxSize: 200
})

// Hook for using cache in components
export function useCache() {
  return {
    get: globalCache.get.bind(globalCache),
    set: globalCache.set.bind(globalCache),
    has: globalCache.has.bind(globalCache),
    delete: globalCache.delete.bind(globalCache),
    clear: globalCache.clear.bind(globalCache),
    invalidatePattern: globalCache.invalidatePattern.bind(globalCache),
    getStats: globalCache.getStats.bind(globalCache)
  }
}

// Utility function for cache invalidation
export function invalidateRelatedCache(type: string, id?: number) {
  switch (type) {
    case 'user':
      globalCache.invalidatePattern('user')
      globalCache.invalidatePattern('user_tasks')
      globalCache.invalidatePattern('user_logs')
      globalCache.invalidatePattern('user_sessions')
      globalCache.invalidatePattern('user_schedule')
      break
    case 'task':
      globalCache.invalidatePattern('task')
      globalCache.invalidatePattern('user_tasks')
      if (id) {
        globalCache.delete(CacheKeys.TASK(id))
      }
      break
    case 'project':
      globalCache.invalidatePattern('project')
      globalCache.invalidatePattern('project_members')
      if (id) {
        globalCache.delete(CacheKeys.PROJECT(id))
        globalCache.delete(CacheKeys.PROJECT_MEMBERS(id))
      }
      break
    case 'reward':
      globalCache.invalidatePattern('reward')
      globalCache.invalidatePattern('purchase')
      break
    case 'lab':
      globalCache.invalidatePattern('lab_')
      break
    case 'all':
      globalCache.clear()
      break
  }
} 