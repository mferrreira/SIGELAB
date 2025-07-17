"use client"

import React, { useMemo, useCallback } from 'react'
import { useVirtualization } from '@/lib/managers/virtualization-manager'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  threshold?: number
  className?: string
  onLoadMore?: () => void
  loading?: boolean
  hasMore?: boolean
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  threshold = 100,
  className = '',
  onLoadMore,
  loading = false,
  hasMore = false
}: VirtualListProps<T>) {
  const {
    state,
    shouldLoadMore,
    handleScroll,
    getItemStyle,
    containerStyle,
    contentStyle
  } = useVirtualization(
    { itemHeight, containerHeight, overscan, threshold },
    items.length
  )

  // Handle load more when scrolling near bottom
  const handleScrollWithLoadMore = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    handleScroll(event)
    
    if (shouldLoadMore && onLoadMore && hasMore && !loading) {
      onLoadMore()
    }
  }, [handleScroll, shouldLoadMore, onLoadMore, hasMore, loading])

  // Memoize visible items to prevent unnecessary re-renders
  const visibleItems = useMemo(() => {
    return state.visibleItems.map(index => ({
      item: items[index],
      index,
      style: getItemStyle(index)
    }))
  }, [state.visibleItems, items, getItemStyle])

  return (
    <div
      style={containerStyle}
      className={className}
      onScroll={handleScrollWithLoadMore}
    >
      <div style={contentStyle}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div style={getItemStyle(items.length)} className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}

// Optimized list component for smaller datasets
interface OptimizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  emptyMessage?: string
  loading?: boolean
  loadingMessage?: string
}

export function OptimizedList<T>({
  items,
  renderItem,
  className = '',
  emptyMessage = 'Nenhum item encontrado',
  loading = false,
  loadingMessage = 'Carregando...'
}: OptimizedListProps<T>) {
  // Memoize rendered items to prevent unnecessary re-renders
  const renderedItems = useMemo(() => {
    return items.map((item, index) => (
      <div key={index} className="mb-2">
        {renderItem(item, index)}
      </div>
    ))
  }, [items, renderItem])

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">{loadingMessage}</span>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <span className="text-muted-foreground">{emptyMessage}</span>
      </div>
    )
  }

  return (
    <div className={className}>
      {renderedItems}
    </div>
  )
}

// Infinite scroll list component
interface InfiniteScrollListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
  className?: string
  threshold?: number
}

export function InfiniteScrollList<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  loading,
  className = '',
  threshold = 100
}: InfiniteScrollListProps<T>) {
  const { useInfiniteScroll } = require('@/lib/managers/virtualization-manager')
  const setLoadMoreRef = useInfiniteScroll(
    () => {
      if (hasMore && !loading) {
        onLoadMore()
      }
    },
    { rootMargin: `${threshold}px` }
  )

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index} className="mb-2">
          {renderItem(item, index)}
        </div>
      ))}
      
      {/* Load more trigger */}
      {hasMore && (
        <div ref={setLoadMoreRef} className="flex items-center justify-center p-4">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Carregando mais...</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Rolando para carregar mais...</span>
          )}
        </div>
      )}
    </div>
  )
} 