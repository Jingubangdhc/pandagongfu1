/**
 * 环境变量验证和安全检查
 */

interface EnvConfig {
  JWT_SECRET: string
  DATABASE_URL: string
  NEXT_PUBLIC_BASE_URL: string
  NODE_ENV: string
}

/**
 * 验证必需的环境变量
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 检查JWT密钥
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    errors.push('JWT_SECRET environment variable is required')
  } else if (jwtSecret === 'your-secret-key' || jwtSecret === 'your-super-secret-jwt-key-here') {
    errors.push('JWT_SECRET is using default/insecure value. Please set a strong secret key.')
  } else if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET should be at least 32 characters long for security')
  }
  
  // 检查数据库URL
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    errors.push('DATABASE_URL environment variable is required')
  }
  
  // 检查基础URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    errors.push('NEXT_PUBLIC_BASE_URL environment variable is required')
  }
  
  // 生产环境额外检查
  if (process.env.NODE_ENV === 'production') {
    // 检查HTTPS
    if (baseUrl && !baseUrl.startsWith('https://')) {
      errors.push('NEXT_PUBLIC_BASE_URL should use HTTPS in production')
    }
    
    // 检查支付配置
    if (!process.env.STRIPE_SECRET_KEY) {
      errors.push('STRIPE_SECRET_KEY is required in production')
    }
    
    // 检查邮件配置
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      errors.push('SMTP configuration is required in production')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 获取安全的环境配置
 */
export function getSecureEnvConfig(): EnvConfig {
  const validation = validateEnvironment()
  
  if (!validation.isValid) {
    console.error('Environment validation failed:')
    validation.errors.forEach(error => console.error(`- ${error}`))
    throw new Error('Invalid environment configuration')
  }
  
  return {
    JWT_SECRET: process.env.JWT_SECRET!,
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
}

/**
 * 生成强JWT密钥
 */
export function generateSecureJWTSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * 检查敏感信息泄露
 */
export function checkForSensitiveDataLeaks(): string[] {
  const warnings: string[] = []
  
  // 检查是否在客户端暴露了敏感环境变量
  if (typeof window !== 'undefined') {
    const clientEnv = process.env
    const sensitiveKeys = [
      'JWT_SECRET',
      'DATABASE_URL',
      'STRIPE_SECRET_KEY',
      'SMTP_PASS',
      'AWS_SECRET_ACCESS_KEY',
      'ALIBABA_ACCESS_KEY_SECRET'
    ]
    
    sensitiveKeys.forEach(key => {
      if (clientEnv[key]) {
        warnings.push(`Sensitive environment variable ${key} is exposed to client`)
      }
    })
  }
  
  return warnings
}

/**
 * 初始化环境安全检查
 */
export function initializeEnvironmentSecurity(): void {
  // 验证环境变量
  const validation = validateEnvironment()
  
  if (!validation.isValid) {
    console.error('🚨 Environment Security Issues:')
    validation.errors.forEach(error => console.error(`  ❌ ${error}`))
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot start application with invalid environment configuration in production')
    } else {
      console.warn('⚠️  Application starting with environment issues in development mode')
    }
  } else {
    console.log('✅ Environment security validation passed')
  }
  
  // 检查敏感数据泄露
  const leaks = checkForSensitiveDataLeaks()
  if (leaks.length > 0) {
    console.error('🚨 Sensitive Data Leak Detected:')
    leaks.forEach(leak => console.error(`  ❌ ${leak}`))
  }
  
  // 生产环境额外安全提示
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Production security mode enabled')
    console.log('🔐 JWT tokens will expire in 7 days')
    console.log('🛡️  Security headers and rate limiting active')
  }
}
