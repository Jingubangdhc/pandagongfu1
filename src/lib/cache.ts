// 缓存策略实现
import { NextRequest, NextResponse } from 'next/server'

// 内存缓存接口
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

// 内存缓存类
class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    // 每5分钟清理一次过期缓存
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  set<T>(key: string, data: T, ttl = 300000): void { // 默认5分钟TTL
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// 全局内存缓存实例
export const memoryCache = new MemoryCache()

// 缓存键生成器
export const cacheKeys = {
  videos: (page?: number, category?: string, search?: string) => 
    `videos:${page || 'all'}:${category || 'all'}:${search || 'all'}`,
  video: (id: string) => `video:${id}`,
  user: (id: string) => `user:${id}`,
  categories: () => 'categories:all',
  tags: () => 'tags:all',
  commission: (userId: string) => `commission:${userId}`,
  progress: (userId: string, videoId: string) => `progress:${userId}:${videoId}`,
  orders: (userId: string) => `orders:${userId}`,
  stats: (type: string, period: string) => `stats:${type}:${period}`,
}

// HTTP 缓存头部设置
export const cacheHeaders = {
  // 静态资源 - 长期缓存
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'ETag': true,
  },
  
  // API 响应 - 短期缓存
  api: {
    'Cache-Control': 'public, max-age=60, s-maxage=60',
    'ETag': true,
  },
  
  // 用户相关数据 - 私有缓存
  private: {
    'Cache-Control': 'private, max-age=300',
    'ETag': true,
  },
  
  // 实时数据 - 不缓存
  noCache: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
}

// 缓存中间件
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300000 // 5分钟
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // 尝试从缓存获取
      const cached = memoryCache.get<T>(key)
      if (cached) {
        resolve(cached)
        return
      }

      // 缓存未命中，执行获取函数
      const data = await fetcher()
      
      // 存储到缓存
      memoryCache.set(key, data, ttl)
      
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

// API 响应缓存装饰器
export function apiCache(ttl = 60000) { // 默认1分钟
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const request = args[0] as NextRequest
      const cacheKey = `api:${request.url}:${request.method}`
      
      try {
        return await withCache(cacheKey, () => method.apply(this, args), ttl)
      } catch (error) {
        // 如果缓存失败，直接执行原方法
        return method.apply(this, args)
      }
    }

    return descriptor
  }
}

// 条件缓存 - 基于用户状态
export async function conditionalCache<T>(
  key: string,
  condition: () => boolean,
  fetcher: () => Promise<T>,
  ttl = 300000
): Promise<T> {
  if (!condition()) {
    return fetcher()
  }
  
  return withCache(key, fetcher, ttl)
}

// 缓存预热
export class CacheWarmer {
  private static instance: CacheWarmer
  private warmupTasks: Array<() => Promise<void>> = []

  static getInstance(): CacheWarmer {
    if (!CacheWarmer.instance) {
      CacheWarmer.instance = new CacheWarmer()
    }
    return CacheWarmer.instance
  }

  addWarmupTask(task: () => Promise<void>): void {
    this.warmupTasks.push(task)
  }

  async warmup(): Promise<void> {
    console.log('开始缓存预热...')
    const startTime = Date.now()
    
    try {
      await Promise.all(this.warmupTasks.map(task => task()))
      console.log(`缓存预热完成，耗时: ${Date.now() - startTime}ms`)
    } catch (error) {
      console.error('缓存预热失败:', error)
    }
  }
}

// 缓存统计
export function getCacheStats() {
  return {
    size: memoryCache['cache'].size,
    maxSize: memoryCache['maxSize'],
    usage: (memoryCache['cache'].size / memoryCache['maxSize']) * 100,
  }
}

// 缓存清理工具
export const cacheUtils = {
  // 清理特定前缀的缓存
  clearByPrefix: (prefix: string) => {
    const cache = memoryCache['cache']
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key)
      }
    }
  },
  
  // 清理用户相关缓存
  clearUserCache: (userId: string) => {
    cacheUtils.clearByPrefix(`user:${userId}`)
    cacheUtils.clearByPrefix(`commission:${userId}`)
    cacheUtils.clearByPrefix(`progress:${userId}`)
    cacheUtils.clearByPrefix(`orders:${userId}`)
  },
  
  // 清理视频相关缓存
  clearVideoCache: (videoId?: string) => {
    if (videoId) {
      cacheUtils.clearByPrefix(`video:${videoId}`)
    } else {
      cacheUtils.clearByPrefix('videos:')
    }
  },
  
  // 获取缓存键列表
  getKeys: () => Array.from(memoryCache['cache'].keys()),
  
  // 获取缓存详情
  getDetails: () => {
    const cache = memoryCache['cache']
    const details: Array<{key: string, size: number, age: number, ttl: number}> = []
    
    for (const [key, item] of cache.entries()) {
      details.push({
        key,
        size: JSON.stringify(item.data).length,
        age: Date.now() - item.timestamp,
        ttl: item.ttl,
      })
    }
    
    return details
  },
}

// 响应缓存中间件
export function withResponseCache(
  response: NextResponse,
  cacheType: keyof typeof cacheHeaders = 'api'
): NextResponse {
  const headers = cacheHeaders[cacheType]
  
  Object.entries(headers).forEach(([key, value]) => {
    if (key === 'ETag' && value) {
      // 生成简单的 ETag
      const etag = `"${Date.now().toString(36)}"`
      response.headers.set('ETag', etag)
    } else if (typeof value === 'string') {
      response.headers.set(key, value)
    }
  })
  
  return response
}
