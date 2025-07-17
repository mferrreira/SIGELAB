// Debounce Manager for API Request Optimization
// This system prevents excessive API calls by debouncing requests

interface DebounceOptions {
  delay?: number // Delay in milliseconds (default: 300ms)
  leading?: boolean // Execute on the leading edge (default: false)
  trailing?: boolean // Execute on the trailing edge (default: true)
}

class DebounceManager {
  private timers = new Map<string, NodeJS.Timeout>()
  private defaultDelay = 300
  private defaultLeading = false
  private defaultTrailing = true

  constructor() {}

  // Debounce a function call
  debounce<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    options: DebounceOptions = {}
  ): (...args: Parameters<T>) => void {
    const delay = options.delay || this.defaultDelay
    const leading = options.leading ?? this.defaultLeading
    const trailing = options.trailing ?? this.defaultTrailing

    return (...args: Parameters<T>) => {
      const existingTimer = this.timers.get(key)
      
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      if (leading && !existingTimer) {
        func(...args)
      }

      if (trailing) {
        const timer = setTimeout(() => {
          if (!leading) {
            func(...args)
          }
          this.timers.delete(key)
        }, delay)
        
        this.timers.set(key, timer)
      }
    }
  }

  // Cancel a debounced function
  cancel(key: string): boolean {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
      return true
    }
    return false
  }

  // Cancel all debounced functions
  cancelAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
  }

  // Check if a debounced function is pending
  isPending(key: string): boolean {
    return this.timers.has(key)
  }

  // Get all pending keys
  getPendingKeys(): string[] {
    return Array.from(this.timers.keys())
  }
}

// Create global debounce instance
export const globalDebounce = new DebounceManager()

// Hook for using debounce in components
export function useDebounce() {
  return {
    debounce: globalDebounce.debounce.bind(globalDebounce),
    cancel: globalDebounce.cancel.bind(globalDebounce),
    cancelAll: globalDebounce.cancelAll.bind(globalDebounce),
    isPending: globalDebounce.isPending.bind(globalDebounce),
    getPendingKeys: globalDebounce.getPendingKeys.bind(globalDebounce)
  }
}

// Preset debounce delays for different use cases
export const DebounceDelays = {
  // Search input debounce
  SEARCH: 300,
  
  // Form input debounce
  FORM_INPUT: 500,
  
  // API request debounce
  API_REQUEST: 1000,
  
  // Scroll event debounce
  SCROLL: 100,
  
  // Resize event debounce
  RESIZE: 250,
  
  // Real-time updates debounce
  REALTIME: 2000,
} as const

// Utility function for creating debounced API calls
export function createDebouncedAPI<T extends (...args: any[]) => any>(
  apiFunction: T,
  delay: number = DebounceDelays.API_REQUEST,
  key?: string
): (...args: Parameters<T>) => void {
  const debounceKey = key || `api_${apiFunction.name}_${Date.now()}`
  
  return globalDebounce.debounce(
    debounceKey,
    apiFunction,
    { delay, leading: false, trailing: true }
  )
} 