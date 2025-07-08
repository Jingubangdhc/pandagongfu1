'use client'

import { useEffect } from 'react'
import { initializeEnvironmentSecurity } from '@/lib/env-validation'

/**
 * 安全提供者组件 - 在客户端初始化安全检查
 */
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 仅在开发环境进行客户端安全检查
    if (process.env.NODE_ENV === 'development') {
      try {
        // 检查客户端环境安全
        console.log('🔍 Performing client-side security checks...')
        
        // 检查是否有敏感信息暴露到客户端
        const sensitiveKeys = [
          'JWT_SECRET',
          'DATABASE_URL', 
          'STRIPE_SECRET_KEY',
          'SMTP_PASS'
        ]
        
        const exposedKeys = sensitiveKeys.filter(key => 
          typeof window !== 'undefined' && (window as any)[key]
        )
        
        if (exposedKeys.length > 0) {
          console.error('🚨 Security Warning: Sensitive keys exposed to client:', exposedKeys)
        } else {
          console.log('✅ Client-side security check passed')
        }
        
        // 检查HTTPS（生产环境）
        if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && 
            process.env.NODE_ENV !== 'development') {
          console.warn('⚠️  Security Warning: Application not running over HTTPS in production')
        }
        
      } catch (error) {
        console.error('Security check failed:', error)
      }
    }
  }, [])

  return <>{children}</>
}
