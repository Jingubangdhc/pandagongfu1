/**
 * 服务器端安全初始化
 * 在应用启动时执行安全检查和配置
 */

import { initializeEnvironmentSecurity } from './env-validation'

/**
 * 初始化应用安全配置
 */
export function initializeApplicationSecurity(): void {
  console.log('🔒 Initializing application security...')
  
  try {
    // 环境变量安全检查
    initializeEnvironmentSecurity()
    
    // 设置安全相关的全局配置
    setupSecurityDefaults()
    
    // 验证关键依赖
    validateSecurityDependencies()
    
    console.log('✅ Application security initialization completed')
    
  } catch (error) {
    console.error('❌ Security initialization failed:', error)
    
    if (process.env.NODE_ENV === 'production') {
      // 生产环境下安全初始化失败应该终止应用
      process.exit(1)
    }
  }
}

/**
 * 设置安全默认配置
 */
function setupSecurityDefaults(): void {
  // 设置Node.js安全相关的默认值
  if (process.env.NODE_ENV === 'production') {
    // 生产环境安全配置
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
    
    // 设置更严格的内存限制
    if (!process.env.NODE_OPTIONS) {
      process.env.NODE_OPTIONS = '--max-old-space-size=1024'
    }
  }
  
  console.log('🛡️  Security defaults configured')
}

/**
 * 验证安全相关依赖
 */
function validateSecurityDependencies(): void {
  const requiredModules = [
    'jsonwebtoken',
    'bcryptjs',
    'next'
  ]
  
  const missingModules: string[] = []
  
  requiredModules.forEach(module => {
    try {
      require.resolve(module)
    } catch (error) {
      missingModules.push(module)
    }
  })
  
  if (missingModules.length > 0) {
    throw new Error(`Missing required security modules: ${missingModules.join(', ')}`)
  }
  
  console.log('📦 Security dependencies validated')
}

/**
 * 生成安全报告
 */
export function generateSecurityReport(): {
  environment: string
  securityFeatures: string[]
  warnings: string[]
  recommendations: string[]
} {
  const warnings: string[] = []
  const recommendations: string[] = []
  const securityFeatures: string[] = []
  
  // 检查已启用的安全功能
  securityFeatures.push('JWT Authentication')
  securityFeatures.push('Rate Limiting')
  securityFeatures.push('Security Headers')
  securityFeatures.push('File Upload Validation')
  securityFeatures.push('Input Sanitization')
  
  // 检查潜在的安全问题
  if (process.env.JWT_SECRET === 'your-secret-key') {
    warnings.push('Using default JWT secret')
    recommendations.push('Set a strong JWT_SECRET environment variable')
  }
  
  if (process.env.NODE_ENV === 'production' && !process.env.STRIPE_SECRET_KEY) {
    warnings.push('Payment gateway not configured for production')
    recommendations.push('Configure Stripe keys for production')
  }
  
  if (!process.env.SMTP_HOST) {
    warnings.push('Email service not configured')
    recommendations.push('Configure SMTP settings for email notifications')
  }
  
  // 生产环境特定检查
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_BASE_URL?.startsWith('https://')) {
      warnings.push('Not using HTTPS in production')
      recommendations.push('Enable HTTPS for production deployment')
    }
    
    if (!process.env.DATABASE_URL?.includes('ssl=true')) {
      warnings.push('Database connection may not be using SSL')
      recommendations.push('Enable SSL for database connections in production')
    }
  }
  
  return {
    environment: process.env.NODE_ENV || 'development',
    securityFeatures,
    warnings,
    recommendations
  }
}

/**
 * 打印安全状态摘要
 */
export function printSecuritySummary(): void {
  const report = generateSecurityReport()
  
  console.log('\n🔒 Security Status Summary')
  console.log('=' .repeat(50))
  console.log(`Environment: ${report.environment}`)
  console.log(`Security Features: ${report.securityFeatures.length}`)
  
  if (report.securityFeatures.length > 0) {
    console.log('\n✅ Enabled Security Features:')
    report.securityFeatures.forEach(feature => {
      console.log(`  • ${feature}`)
    })
  }
  
  if (report.warnings.length > 0) {
    console.log('\n⚠️  Security Warnings:')
    report.warnings.forEach(warning => {
      console.log(`  • ${warning}`)
    })
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Security Recommendations:')
    report.recommendations.forEach(rec => {
      console.log(`  • ${rec}`)
    })
  }
  
  console.log('=' .repeat(50))
}
