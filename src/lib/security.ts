import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// 速率限制配置
interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
  message?: string // 限制消息
}

// 内存存储的请求计数器
const requestCounts = new Map<string, { count: number; resetTime: number }>()

/**
 * 速率限制中间件
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest) => {
    const ip = getClientIP(request)
    const now = Date.now()
    const key = `${ip}:${request.nextUrl.pathname}`
    
    // 清理过期的计数器
    cleanupExpiredCounters(now)
    
    const current = requestCounts.get(key)
    
    if (!current || now > current.resetTime) {
      // 新的时间窗口
      requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // 允许请求
    }
    
    if (current.count >= config.maxRequests) {
      // 超过限制
      return NextResponse.json(
        { 
          error: config.message || '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, config.maxRequests - current.count).toString(),
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
          }
        }
      )
    }
    
    // 增加计数
    current.count++
    return null // 允许请求
  }
}

/**
 * 获取客户端IP地址
 */
function getClientIP(request: NextRequest): string {
  // 尝试从各种头部获取真实IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // 回退到连接IP
  return request.ip || '127.0.0.1'
}

/**
 * 清理过期的计数器
 */
function cleanupExpiredCounters(now: number) {
  const entries = Array.from(requestCounts.entries())
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      requestCounts.delete(key)
    }
  }
}

/**
 * 安全头部设置
 */
export function setSecurityHeaders(response: NextResponse): NextResponse {
  // 内容安全策略
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https: blob:",
      "connect-src 'self' https://api.stripe.com https://uploads.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  )
  
  // 其他安全头部
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (仅在HTTPS环境下)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  return response
}

/**
 * CSRF保护
 */
export function validateCSRFToken(request: NextRequest): boolean {
  // 对于GET、HEAD、OPTIONS请求不需要CSRF保护
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true
  }
  
  const token = request.headers.get('x-csrf-token') || 
                request.headers.get('x-xsrf-token')
  const cookieToken = request.cookies.get('csrf-token')?.value
  
  if (!token || !cookieToken || token !== cookieToken) {
    return false
  }
  
  return true
}

/**
 * 生成CSRF令牌
 */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * 输入验证和清理
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // 移除潜在的XSS字符
  return input
    .replace(/[<>]/g, '') // 移除尖括号
    .replace(/javascript:/gi, '') // 移除javascript协议
    .replace(/on\w+=/gi, '') // 移除事件处理器
    .trim()
}

/**
 * 验证文件类型
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  // 检查MIME类型
  if (!allowedTypes.includes(file.type)) {
    return false
  }
  
  // 检查文件扩展名
  const extension = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = allowedTypes.map(type => {
    switch (type) {
      case 'image/jpeg': return ['jpg', 'jpeg']
      case 'image/png': return ['png']
      case 'image/gif': return ['gif']
      case 'image/webp': return ['webp']
      case 'video/mp4': return ['mp4']
      case 'video/webm': return ['webm']
      case 'video/quicktime': return ['mov']
      default: return []
    }
  }).flat()
  
  return extension ? allowedExtensions.includes(extension) : false
}

/**
 * 文件大小验证
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes
}

/**
 * 预定义的速率限制配置
 */
export const rateLimitConfigs = {
  // 严格限制 - 登录、注册等敏感操作
  strict: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
    message: '操作过于频繁，请15分钟后再试'
  },
  
  // 中等限制 - API调用
  moderate: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 100,
    message: '请求过于频繁，请稍后再试'
  },
  
  // 宽松限制 - 一般页面访问
  lenient: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 1000,
    message: '访问过于频繁，请稍后再试'
  },
  
  // 文件上传限制
  upload: {
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 50,
    message: '文件上传过于频繁，请1小时后再试'
  }
}
