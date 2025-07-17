import { useState, useMemo, useCallback, useEffect } from 'react'

// Virtualization Manager for Large List Optimization
// This system provides virtual scrolling and lazy loading for better performance

interface VirtualizationOptions {
  itemHeight: number // Height of each item in pixels
  containerHeight: number // Height of the container
  overscan?: number // Number of items to render outside the viewport
  threshold?: number // Distance from bottom to trigger loading more items
}

interface VirtualizationState {
  startIndex: number
  endIndex: number
  visibleItems: number[]
  totalHeight: number
  scrollTop: number
}

class VirtualizationManager {
  private options: Required<VirtualizationOptions>
  private state: VirtualizationState = {
    startIndex: 0,
    endIndex: 0,
    visibleItems: [],
    totalHeight: 0,
    scrollTop: 0
  }

  constructor(options: VirtualizationOptions) {
    this.options = {
      overscan: 5,
      threshold: 100,
      ...options
    }
  }

  // Calculate visible range based on scroll position
  calculateVisibleRange(scrollTop: number, totalItems: number): VirtualizationState {
    const { itemHeight, containerHeight, overscan } = this.options
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      totalItems - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const visibleItems = Array.from(
      { length: endIndex - startIndex + 1 },
      (_, i) => startIndex + i
    )

    return {
      startIndex,
      endIndex,
      visibleItems,
      totalHeight: totalItems * itemHeight,
      scrollTop
    }
  }

  // Check if we should load more items
  shouldLoadMore(scrollTop: number, totalItems: number): boolean {
    const { containerHeight, threshold, itemHeight } = this.options
    const scrollBottom = scrollTop + containerHeight
    const contentBottom = totalItems * itemHeight
    
    return contentBottom - scrollBottom < threshold
  }

  // Get transform for positioning items
  getItemTransform(index: number): string {
    const { itemHeight } = this.options
    return `translateY(${index * itemHeight}px)`
  }

  // Update options
  updateOptions(newOptions: Partial<VirtualizationOptions>): void {
    this.options = { ...this.options, ...newOptions }
  }

  // Get current state
  getState(): VirtualizationState {
    return { ...this.state }
  }
}

// Hook for using virtualization in components
export function useVirtualization(
  options: VirtualizationOptions,
  totalItems: number
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [manager] = useState(() => new VirtualizationManager(options))
  
  const state = useMemo(() => {
    return manager.calculateVisibleRange(scrollTop, totalItems)
  }, [manager, scrollTop, totalItems])

  const shouldLoadMore = useMemo(() => {
    return manager.shouldLoadMore(scrollTop, totalItems)
  }, [manager, scrollTop, totalItems])

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop: newScrollTop } = event.currentTarget
    setScrollTop(newScrollTop)
  }, [])

  const getItemStyle = useCallback((index: number) => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: options.itemHeight,
    transform: manager.getItemTransform(index)
  }), [manager, options.itemHeight])

  return {
    state,
    shouldLoadMore,
    handleScroll,
    getItemStyle,
    containerStyle: {
      height: options.containerHeight,
      overflow: 'auto' as const,
      position: 'relative' as const
    },
    contentStyle: {
      height: state.totalHeight,
      position: 'relative' as const
    }
  }
}

// Lazy loading hook for pagination
export function useLazyLoading<T>(
  fetchFunction: (page: number) => Promise<T[]>,
  pageSize: number = 20
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    try {
      setLoading(true)
      setError(null)
      
      const newItems = await fetchFunction(page)
      
      if (newItems.length < pageSize) {
        setHasMore(false)
      }
      
      setItems(prev => [...prev, ...newItems])
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, page, pageSize, loading, hasMore])

  const reset = useCallback(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  }
}

// Intersection Observer hook for infinite scrolling
export function useInfiniteScroll(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options
      }
    )

    observer.observe(ref)

    return () => {
      observer.disconnect()
    }
  }, [ref, callback, options])

  return setRef
}

// Memoization hook for expensive computations
export function useMemoizedValue<T>(
  computeFunction: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(computeFunction, dependencies)
}

// Throttled scroll hook
export function useThrottledScroll(
  callback: (scrollTop: number) => void,
  delay: number = 16 // ~60fps
) {
  const [throttledCallback] = useState(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastCall = 0

    return (scrollTop: number) => {
      const now = Date.now()
      
      if (now - lastCall >= delay) {
        callback(scrollTop)
        lastCall = now
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          callback(scrollTop)
          lastCall = Date.now()
        }, delay - (now - lastCall))
      }
    }
  })

  return throttledCallback
} 