import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface AuthUser {
  userId: string
  email: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
}

/**
 * 验证JWT token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      console.error('JWT_SECRET environment variable is not set')
      throw new Error('JWT configuration error')
    }
    return jwt.verify(token, secret) as AuthUser
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * 从请求中提取token
 */
export function extractToken(request: NextRequest | Request): string | null {
  // 从Authorization header获取
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '')
  }

  // 从cookie获取
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const match = cookieHeader.match(/auth-token=([^;]+)/)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * 验证用户认证
 * 优先从中间件设置的请求头中获取用户信息，如果没有则从token中验证
 */
export function authenticateUser(request: NextRequest | Request): AuthUser | null {
  // 首先尝试从中间件设置的请求头中获取用户信息
  const userId = request.headers.get('x-user-id')
  const email = request.headers.get('x-user-email')
  const role = request.headers.get('x-user-role')

  if (userId && email && role) {
    return {
      userId,
      email,
      role: role as 'USER' | 'ADMIN' | 'SUPER_ADMIN'
    }
  }

  // 如果没有从请求头获取到，则尝试从token中验证
  const token = extractToken(request)
  if (!token) {
    return null
  }

  return verifyToken(token)
}

/**
 * 验证管理员权限
 */
export function requireAdmin(request: NextRequest | Request): AuthUser | null {
  const user = authenticateUser(request)
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null
  }
  
  return user
}

/**
 * 验证超级管理员权限
 */
export function requireSuperAdmin(request: NextRequest | Request): AuthUser | null {
  const user = authenticateUser(request)
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null
  }
  
  return user
}

/**
 * 生成JWT token
 */
export function generateToken(user: { id: string; email: string; role: string }): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('JWT_SECRET environment variable is not set')
    throw new Error('JWT configuration error')
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    secret,
    {
      expiresIn: '7d',
      issuer: 'pandagongfu-hui',
      audience: 'pandagongfu-hui-users'
    }
  )
}
