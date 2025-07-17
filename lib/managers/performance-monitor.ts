// Performance Monitor
// This system tracks and reports performance metrics

interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  memoryUsage: number
  cacheHitRate: number
  databaseQueryTime: number
  renderTime: number
}

interface PerformanceEvent {
  type: string
  timestamp: number
  duration: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private events: PerformanceEvent[] = []
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: Array<(metrics: PerformanceMetrics) => void> = []
  private isEnabled = process.env.NODE_ENV === 'development'

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeBrowserMonitoring()
    }
  }

  // Track page load performance
  trackPageLoad(): void {
    if (!this.isEnabled || typeof window === 'undefined') return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart
      this.addEvent('page_load', this.metrics.pageLoadTime)
    }
  }

  // Track API response time
  trackApiCall(url: string, startTime: number, endTime: number): void {
    if (!this.isEnabled) return

    const duration = endTime - startTime
    this.metrics.apiResponseTime = duration
    this.addEvent('api_call', duration, { url })
  }

  // Track database query time
  trackDatabaseQuery(query: string, startTime: number, endTime: number): void {
    if (!this.isEnabled) return

    const duration = endTime - startTime
    this.metrics.databaseQueryTime = duration
    this.addEvent('database_query', duration, { query })
  }

  // Track component render time
  trackRenderTime(componentName: string, startTime: number, endTime: number): void {
    if (!this.isEnabled) return

    const duration = endTime - startTime
    this.metrics.renderTime = duration
    this.addEvent('render', duration, { component: componentName })
  }

  // Track cache performance
  trackCacheHit(hit: boolean): void {
    if (!this.isEnabled) return

    const event = this.events.find(e => e.type === 'cache_access')
    if (event) {
      const hits = event.metadata?.hits || 0
      const total = event.metadata?.total || 0
      event.metadata = {
        hits: hits + (hit ? 1 : 0),
        total: total + 1,
        hitRate: ((hits + (hit ? 1 : 0)) / (total + 1)) * 100
      }
      this.metrics.cacheHitRate = event.metadata.hitRate
    } else {
      this.addEvent('cache_access', 0, {
        hits: hit ? 1 : 0,
        total: 1,
        hitRate: hit ? 100 : 0
      })
    }
  }

  // Track memory usage
  trackMemoryUsage(): void {
    if (!this.isEnabled || typeof window === 'undefined') return

    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize * 100
      this.addEvent('memory_usage', this.metrics.memoryUsage, {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      })
    }
  }

  // Add performance event
  private addEvent(type: string, duration: number, metadata?: Record<string, any>): void {
    const event: PerformanceEvent = {
      type,
      timestamp: Date.now(),
      duration,
      metadata
    }

    this.events.push(event)
    this.notifyObservers()
  }

  // Subscribe to performance updates
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback)
    return () => {
      const index = this.observers.indexOf(callback)
      if (index > -1) {
        this.observers.splice(index, 1)
      }
    }
  }

  // Notify observers of metric changes
  private notifyObservers(): void {
    const metrics = this.getMetrics()
    this.observers.forEach(callback => callback(metrics))
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return {
      pageLoadTime: this.metrics.pageLoadTime || 0,
      apiResponseTime: this.metrics.apiResponseTime || 0,
      memoryUsage: this.metrics.memoryUsage || 0,
      cacheHitRate: this.metrics.cacheHitRate || 0,
      databaseQueryTime: this.metrics.databaseQueryTime || 0,
      renderTime: this.metrics.renderTime || 0
    }
  }

  // Get performance events
  getEvents(type?: string): PerformanceEvent[] {
    if (type) {
      return this.events.filter(event => event.type === type)
    }
    return [...this.events]
  }

  // Get average metrics
  getAverageMetrics(): Partial<PerformanceMetrics> {
    const eventsByType = this.events.reduce((acc, event) => {
      if (!acc[event.type]) {
        acc[event.type] = []
      }
      acc[event.type].push(event.duration)
      return acc
    }, {} as Record<string, number[]>)

    return {
      apiResponseTime: this.calculateAverage(eventsByType['api_call']),
      databaseQueryTime: this.calculateAverage(eventsByType['database_query']),
      renderTime: this.calculateAverage(eventsByType['render'])
    }
  }

  // Calculate average of array
  private calculateAverage(values?: number[]): number {
    if (!values || values.length === 0) return 0
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  // Initialize browser-specific monitoring
  private initializeBrowserMonitoring(): void {
    // Monitor page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.trackMemoryUsage()
      }
    })

    // Monitor beforeunload for final metrics
    window.addEventListener('beforeunload', () => {
      this.trackMemoryUsage()
      this.logFinalMetrics()
    })

    // Track initial page load
    if (document.readyState === 'complete') {
      this.trackPageLoad()
    } else {
      window.addEventListener('load', () => {
        this.trackPageLoad()
      })
    }
  }

  // Log final metrics before page unload
  private logFinalMetrics(): void {
    if (this.isEnabled) {
      console.log('Performance Metrics:', this.getMetrics())
      console.log('Average Metrics:', this.getAverageMetrics())
      console.log('Total Events:', this.events.length)
    }
  }

  // Clear all data
  clear(): void {
    this.events = []
    this.metrics = {}
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for tracking component performance
export function usePerformanceTracking(componentName: string) {
  const startTime = useRef(performance.now())

  useEffect(() => {
    const endTime = performance.now()
    performanceMonitor.trackRenderTime(componentName, startTime.current, endTime)
    startTime.current = performance.now()
  })

  return {
    trackApiCall: (url: string, startTime: number, endTime: number) => {
      performanceMonitor.trackApiCall(url, startTime, endTime)
    },
    trackDatabaseQuery: (query: string, startTime: number, endTime: number) => {
      performanceMonitor.trackDatabaseQuery(query, startTime, endTime)
    }
  }
}

// Higher-order component for performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    usePerformanceTracking(componentName)
    return <WrappedComponent {...props} />
  }
}

// Utility for tracking async operations
export async function trackAsyncOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = performance.now()
  try {
    const result = await operation()
    const endTime = performance.now()
    performanceMonitor.trackApiCall(operationName, startTime, endTime)
    return result
  } catch (error) {
    const endTime = performance.now()
    performanceMonitor.trackApiCall(operationName, startTime, endTime)
    throw error
  }
}

// Performance dashboard component (development only)
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceMonitor.getMetrics())

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const unsubscribe = performanceMonitor.subscribe(setMetrics)
      return unsubscribe
    }
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="mb-2 font-bold">Performance Metrics</div>
      <div>Page Load: {metrics.pageLoadTime.toFixed(2)}ms</div>
      <div>API Response: {metrics.apiResponseTime.toFixed(2)}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(1)}%</div>
      <div>Cache Hit: {metrics.cacheHitRate.toFixed(1)}%</div>
      <div>DB Query: {metrics.databaseQueryTime.toFixed(2)}ms</div>
      <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
    </div>
  )
} 