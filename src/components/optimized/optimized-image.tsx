'use client'

import Image from 'next/image'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  onLoad,
  onError,
  fallbackSrc = '/api/placeholder/400/300',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    }
    onError?.()
  }, [currentSrc, fallbackSrc, onError])

  // 生成模糊占位符
  const generateBlurDataURL = (w: number, h: number) => {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      // 服务器端返回简单的SVG占位符
      return `data:image/svg+xml;base64,${Buffer.from(
        `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>`
      ).toString('base64')}`
    }

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, w, h)
    }
    return canvas.toDataURL()
  }

  // 响应式尺寸配置
  const responsiveSizes = sizes || `
    (max-width: 640px) 100vw,
    (max-width: 768px) 50vw,
    (max-width: 1024px) 33vw,
    25vw
  `

  const imageProps = {
    src: currentSrc,
    alt,
    quality,
    priority,
    placeholder,
    blurDataURL: blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined),
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'transition-opacity duration-300',
      isLoading && 'opacity-0',
      !isLoading && 'opacity-100',
      hasError && 'opacity-50',
      className
    ),
    ...(fill ? { fill: true, sizes: responsiveSizes } : { width, height }),
  }

  return (
    <div className={cn('relative overflow-hidden', fill && 'w-full h-full')}>
      {/* 加载状态 */}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
          fill ? 'w-full h-full' : `w-[${width}px] h-[${height}px]`
        )}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* 错误状态 */}
      {hasError && currentSrc === fallbackSrc && (
        <div className={cn(
          'absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500',
          fill ? 'w-full h-full' : `w-[${width}px] h-[${height}px]`
        )}>
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">图片加载失败</span>
        </div>
      )}

      <Image {...imageProps} />
    </div>
  )
}

// 预设的图片组件变体
export function VideoThumbnail({ src, alt, className, ...props }: Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={225}
      className={cn('aspect-video object-cover', className)}
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
      quality={85}
      {...props}
    />
  )
}

export function UserAvatar({ src, alt, size = 40, className, ...props }: Omit<OptimizedImageProps, 'width' | 'height'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      quality={90}
      {...props}
    />
  )
}

export function HeroImage({ src, alt, className, ...props }: Omit<OptimizedImageProps, 'fill'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={cn('object-cover', className)}
      priority
      quality={90}
      sizes="100vw"
      {...props}
    />
  )
}

// 图片预加载 Hook
export function useImagePreload(urls: string[]) {
  const preloadImages = useCallback(() => {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  }, [urls])

  return { preloadImages }
}

// 懒加载图片组件
export function LazyImage(props: OptimizedImageProps) {
  const [isVisible, setIsVisible] = useState(false)

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    if (entry.isIntersecting) {
      setIsVisible(true)
    }
  }, [])

  // 使用 Intersection Observer 实现懒加载
  const ref = useCallback((node: HTMLDivElement) => {
    if (node) {
      const observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.1,
        rootMargin: '50px',
      })
      observer.observe(node)
      return () => observer.disconnect()
    }
  }, [handleIntersection])

  return (
    <div ref={ref} className={props.fill ? 'w-full h-full' : undefined}>
      {isVisible ? (
        <OptimizedImage {...props} />
      ) : (
        <div className={cn(
          'bg-gray-200 animate-pulse',
          props.fill ? 'w-full h-full' : `w-[${props.width}px] h-[${props.height}px]`
        )} />
      )}
    </div>
  )
}
