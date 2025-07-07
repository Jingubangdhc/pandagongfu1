import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

// 需要认证的路径
const protectedPaths = [
  '/dashboard',
  '/api/payments',
  '/api/user',
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
  '/api/categories'
]

function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path))
  const isPublicApiPath = publicApiPaths.some(path => pathname.startsWith(path))
  
  // 公开API路径直接通过
  if (isPublicApiPath) {
    return NextResponse.next()
  }
  
  // 获取token
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // 如果是受保护的路径但没有token
  if (isProtectedPath && !token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }
    // 重定向到登录页面
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // 验证token
  if (token) {
    const decoded = verifyToken(token)
    
    if (!decoded) {
      // token无效
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: '无效的访问令牌' },
          { status: 401 }
        )
      }
      // 清除无效token并重定向到登录页面
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }
    
    // 检查管理员权限
    if (isAdminPath && decoded.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: '权限不足' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // 将用户信息添加到请求头中，供API路由使用
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId)
    requestHeaders.set('x-user-email', decoded.email)
    requestHeaders.set('x-user-role', decoded.role)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  return NextResponse.next()
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
