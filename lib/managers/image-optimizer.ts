import { useState, useMemo, useCallback, useEffect, useRef } from 'react'

// Image Optimizer for Performance
// This system provides lazy loading, preloading, and optimization for images

interface ImageOptimizerOptions {
  lazy?: boolean
  preload?: boolean
  placeholder?: string
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  sizes?: string
}

class ImageOptimizer {
  private preloadedImages = new Set<string>()
  private observer: IntersectionObserver | null = null

  constructor() {
    // Initialize intersection observer for lazy loading
    if (typeof window !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              this.loadImage(img)
              this.observer?.unobserve(img)
            }
          })
        },
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      )
    }
  }

  // Optimize image URL with Next.js Image optimization
  optimizeImageUrl(
    src: string,
    width: number,
    height: number,
    quality: number = 75,
    format: 'webp' | 'jpeg' | 'png' = 'webp'
  ): string {
    // If it's already an optimized URL, return as is
    if (src.includes('/_next/image')) {
      return src
    }

    // For external images, use a proxy or return as is
    if (src.startsWith('http')) {
      return src
    }

    // For local images, use Next.js Image optimization
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}&f=${format}`
  }

  // Preload an image
  preloadImage(src: string): Promise<void> {
    if (this.preloadedImages.has(src)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.preloadedImages.add(src)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  // Load image with lazy loading
  loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src
    if (src) {
      img.src = src
      img.removeAttribute('data-src')
    }
  }

  // Observe image for lazy loading
  observeImage(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(img)
    }
  }

  // Generate responsive image srcset
  generateSrcSet(
    src: string,
    widths: number[],
    quality: number = 75,
    format: 'webp' | 'jpeg' | 'png' = 'webp'
  ): string {
    return widths
      .map(width => `${this.optimizeImageUrl(src, width, width, quality, format)} ${width}w`)
      .join(', ')
  }

  // Generate sizes attribute for responsive images
  generateSizes(breakpoints: { [key: string]: string }): string {
    return Object.entries(breakpoints)
      .map(([media, size]) => `${media} ${size}`)
      .join(', ')
  }

  // Create a blur placeholder
  createBlurPlaceholder(width: number, height: number, color: string = '#f3f4f6'): string {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, width, height)
    }
    
    return canvas.toDataURL()
  }

  // Cleanup
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
    }
    this.preloadedImages.clear()
  }
}

// Create global image optimizer instance
export const imageOptimizer = new ImageOptimizer()

// Hook for using image optimization in components
export function useImageOptimization() {
  return {
    optimizeImageUrl: imageOptimizer.optimizeImageUrl.bind(imageOptimizer),
    preloadImage: imageOptimizer.preloadImage.bind(imageOptimizer),
    generateSrcSet: imageOptimizer.generateSrcSet.bind(imageOptimizer),
    generateSizes: imageOptimizer.generateSizes.bind(imageOptimizer),
    createBlurPlaceholder: imageOptimizer.createBlurPlaceholder.bind(imageOptimizer)
  }
}

// Optimized Image Component
interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  lazy?: boolean
  preload?: boolean
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  sizes?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  preload = false,
  quality = 75,
  format = 'webp',
  sizes,
  placeholder,
  onLoad,
  onError
}: OptimizedImageProps) {
  const { optimizeImageUrl, preloadImage } = useImageOptimization()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const optimizedSrc = useMemo(() => {
    return optimizeImageUrl(src, width, height, quality, format)
  }, [src, width, height, quality, format])

  // Preload image if requested
  useEffect(() => {
    if (preload) {
      preloadImage(optimizedSrc).catch(() => {
        setHasError(true)
      })
    }
  }, [preload, optimizedSrc])

  // Setup lazy loading
  useEffect(() => {
    if (lazy && imgRef.current) {
      imageOptimizer.observeImage(imgRef.current)
    }
  }, [lazy])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className}`}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Erro ao carregar imagem</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Placeholder */}
      {placeholder && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${placeholder})`,
            filter: 'blur(10px)'
          }}
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={lazy ? undefined : optimizedSrc}
        data-src={lazy ? optimizedSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}

// Asset preloader for critical resources
export function useAssetPreloader(assets: string[]) {
  const [loadedAssets, setLoadedAssets] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const promises = assets.map(asset => {
          if (asset.endsWith('.css')) {
            return loadCSS(asset)
          } else if (asset.endsWith('.js')) {
            return loadJS(asset)
          } else {
            return imageOptimizer.preloadImage(asset)
          }
        })

        await Promise.all(promises)
        setLoadedAssets(new Set(assets))
      } catch (error) {
        console.error('Error preloading assets:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [assets])

  return { loadedAssets, loading }
}

// Utility functions for loading different asset types
function loadCSS(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = reject
    document.head.appendChild(link)
  })
}

function loadJS(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
} 