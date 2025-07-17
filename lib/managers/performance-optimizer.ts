import { useCallback, useMemo, useRef, useEffect, useState } from 'react'

// Performance Optimizer
// This system provides utilities for optimizing React component performance

// Debounced hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttled hook for scroll events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0)
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now()

      if (now - lastCall.current >= delay) {
        callback(...args)
        lastCall.current = now
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current)
        }

        lastCallTimer.current = setTimeout(() => {
          callback(...args)
          lastCall.current = Date.now()
        }, delay - (now - lastCall.current))
      }
    }) as T,
    [callback, delay]
  )
}

// Memoized expensive computation
export function useMemoizedComputation<T>(
  computeFunction: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(computeFunction, dependencies)
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          callback(entry.isIntersecting)
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [callback, options])

  return elementRef
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling(
  itemCount: number,
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      itemCount - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return {
      startIndex,
      endIndex,
      visibleItems: Array.from(
        { length: endIndex - startIndex + 1 },
        (_, i) => startIndex + i
      )
    }
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan])

  const totalHeight = itemCount * itemHeight

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  const getItemStyle = useCallback(
    (index: number) => ({
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: itemHeight,
      transform: `translateY(${index * itemHeight}px)`
    }),
    [itemHeight]
  )

  return {
    visibleRange,
    totalHeight,
    handleScroll,
    getItemStyle,
    containerStyle: {
      height: containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const
    }
  }
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(performance.now())

  useEffect(() => {
    renderCount.current += 1
    const now = performance.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now

  })

  return {
    renderCount: renderCount.current
  }
}

// Resource preloader hook
export function useResourcePreloader(resources: string[]) {
  const [loadedResources, setLoadedResources] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const preloadResources = async () => {
      try {
        const promises = resources.map((resource) => {
          if (resource.endsWith('.css')) {
            return preloadCSS(resource)
          } else if (resource.endsWith('.js')) {
            return preloadJS(resource)
          } else {
            return preloadImage(resource)
          }
        })

        await Promise.all(promises)
        setLoadedResources(new Set(resources))
      } catch (error) {
        console.error('Error preloading resources:', error)
      } finally {
        setLoading(false)
      }
    }

    preloadResources()
  }, [resources])

  return { loadedResources, loading }
}

// Utility functions for preloading
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

function preloadCSS(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = reject
    document.head.appendChild(link)
  })
}

function preloadJS(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Batch updates hook for multiple state updates
export function useBatchUpdates() {
  const batchRef = useRef<(() => void)[]>([])

  const addToBatch = useCallback((update: () => void) => {
    batchRef.current.push(update)
  }, [])

  const executeBatch = useCallback(() => {
    const updates = batchRef.current
    batchRef.current = []
    
    // Execute updates in batch
    updates.forEach(update => update())
  }, [])

  return { addToBatch, executeBatch }
}

// Memory usage monitor (development only)
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in (performance as any)) {
      const updateMemoryInfo = () => {
        setMemoryInfo((performance as any).memory)
      }

      updateMemoryInfo()
      const interval = setInterval(updateMemoryInfo, 5000)

      return () => clearInterval(interval)
    }
  }, [])

  return memoryInfo
} 