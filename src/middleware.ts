import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit, setSecurityHeaders, validateCSRFToken, rateLimitConfigs } from '@/lib/security'

// 需要认证的路径
const protectedPaths = [
  '/dashboard',
  '/api/payments',
  '/api/user',
  '/api/commissions',
  '/api/withdrawals',
  '/checkout'
]

// 管理员专用路径
const adminPaths = [
  '/admin',
  '/api/admin'
]

// 公开API路径
const publicApiPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/videos',
  '/api/categories',
  '/api/debug'
]

// JWT验证在Edge Runtime中不可用，由API路由自己处理认证

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 应用速率限制
  let rateLimitResponse = null

  // 根据路径类型应用不同的速率限制
  if (pathname.startsWith('/api/auth/')) {
    // 认证相关API使用严格限制
    rateLimitResponse = rateLimit(rateLimitConfigs.strict)(request)
  } else if (pathname.startsWith('/api/upload')) {
    // 文件上传使用上传限制
    rateLimitResponse = rateLimit(rateLimitConfigs.upload)(request)
  } else if (pathname.startsWith('/api/')) {
    // 其他API使用中等限制
    rateLimitResponse = rateLimit(rateLimitConfigs.moderate)(request)
  } else {
    // 页面访问使用宽松限制
    rateLimitResponse = rateLimit(rateLimitConfigs.lenient)(request)
  }

  if (rateLimitResponse) {
    return setSecurityHeaders(rateLimitResponse)
  }

  // 检查是否是受保护的路径
  const isProtectedPagePath = protectedPaths.some(path =>
    pathname.startsWith(path) && !pathname.startsWith('/api/')
  )
  const isAdminPagePath = adminPaths.some(path =>
    pathname.startsWith(path) && !pathname.startsWith('/api/')
  )
  const isPublicApiPath = publicApiPaths.some(path => pathname.startsWith(path))

  // 公开API路径直接通过（但仍应用安全头部）
  if (isPublicApiPath) {
    const response = NextResponse.next()
    return setSecurityHeaders(response)
  }

  // API路径直接通过，让API路由自己处理认证（但仍应用安全头部）
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    return setSecurityHeaders(response)
  }

  // 获取token（仅用于页面路由）
  const token = request.cookies.get('auth-token')?.value

  // 如果是受保护的页面路径但没有token
  if (isProtectedPagePath && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    return setSecurityHeaders(response)
  }

  // 如果是管理员页面路径但没有token
  if (isAdminPagePath && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    return setSecurityHeaders(response)
  }

  // 为所有响应添加安全头部
  const response = NextResponse.next()
  return setSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
