import { NextResponse } from 'next/server'

/**
 * 标准化的API错误响应格式
 */
export interface ApiErrorResponse {
  error: string
  message: string
  code?: string
  details?: any
  timestamp: string
  path?: string
}

/**
 * 错误类型枚举
 */
export enum ErrorCode {
  // 认证相关
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // 验证相关
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // 资源相关
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // 业务逻辑相关
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // 系统相关
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

/**
 * 自定义API错误类
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: ErrorCode
  public readonly details?: any

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    details?: any
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

/**
 * 错误消息映射
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: '请先登录后再进行此操作',
  [ErrorCode.FORBIDDEN]: '您没有权限执行此操作',
  [ErrorCode.TOKEN_EXPIRED]: '登录状态已过期，请重新登录',
  [ErrorCode.INVALID_CREDENTIALS]: '用户名或密码错误',
  
  [ErrorCode.VALIDATION_ERROR]: '输入信息格式不正确',
  [ErrorCode.MISSING_REQUIRED_FIELD]: '请填写所有必需的信息',
  [ErrorCode.INVALID_FORMAT]: '输入格式不正确',
  
  [ErrorCode.NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.ALREADY_EXISTS]: '资源已存在',
  [ErrorCode.RESOURCE_CONFLICT]: '资源冲突，请稍后重试',
  
  [ErrorCode.INSUFFICIENT_BALANCE]: '余额不足，请先充值',
  [ErrorCode.OPERATION_NOT_ALLOWED]: '当前状态下不允许此操作',
  [ErrorCode.QUOTA_EXCEEDED]: '已超出使用限额',
  
  [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器内部错误，请稍后重试',
  [ErrorCode.DATABASE_ERROR]: '数据库操作失败，请稍后重试',
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: '外部服务暂时不可用，请稍后重试',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: '请求过于频繁，请稍后重试'
}

/**
 * 创建标准化的错误响应
 */
export function createErrorResponse(
  error: string | ApiError,
  statusCode?: number,
  code?: ErrorCode,
  details?: any,
  path?: string
): NextResponse<ApiErrorResponse> {
  let errorMessage: string
  let errorCode: ErrorCode
  let errorStatusCode: number
  let errorDetails: any

  if (error instanceof ApiError) {
    errorMessage = error.message
    errorCode = error.code
    errorStatusCode = error.statusCode
    errorDetails = error.details
  } else {
    errorMessage = typeof error === 'string' ? error : '未知错误'
    errorCode = code || ErrorCode.INTERNAL_SERVER_ERROR
    errorStatusCode = statusCode || 500
    errorDetails = details
  }

  // 获取用户友好的错误消息
  const userFriendlyMessage = ERROR_MESSAGES[errorCode] || errorMessage

  const response: ApiErrorResponse = {
    error: errorMessage,
    message: userFriendlyMessage,
    code: errorCode,
    details: errorDetails,
    timestamp: new Date().toISOString(),
    path
  }

  return NextResponse.json(response, { status: errorStatusCode })
}

/**
 * 处理API路由中的错误
 */
export function handleApiError(error: any, path?: string): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)

  // 如果是自定义API错误
  if (error instanceof ApiError) {
    return createErrorResponse(error, undefined, undefined, undefined, path)
  }

  // Prisma错误处理
  if (error.code === 'P2002') {
    return createErrorResponse(
      '数据已存在',
      409,
      ErrorCode.ALREADY_EXISTS,
      { constraint: error.meta?.target },
      path
    )
  }

  if (error.code === 'P2025') {
    return createErrorResponse(
      '请求的资源不存在',
      404,
      ErrorCode.NOT_FOUND,
      undefined,
      path
    )
  }

  // JWT错误处理
  if (error.name === 'JsonWebTokenError') {
    return createErrorResponse(
      '无效的访问令牌',
      401,
      ErrorCode.UNAUTHORIZED,
      undefined,
      path
    )
  }

  if (error.name === 'TokenExpiredError') {
    return createErrorResponse(
      '访问令牌已过期',
      401,
      ErrorCode.TOKEN_EXPIRED,
      undefined,
      path
    )
  }

  // 验证错误处理
  if (error.name === 'ValidationError') {
    return createErrorResponse(
      '输入数据验证失败',
      400,
      ErrorCode.VALIDATION_ERROR,
      error.details,
      path
    )
  }

  // 默认服务器错误
  return createErrorResponse(
    '服务器内部错误',
    500,
    ErrorCode.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === 'development' ? error.stack : undefined,
    path
  )
}

/**
 * 异步错误处理装饰器
 */
export function withErrorHandler(handler: Function) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      const url = new URL(request.url)
      return handleApiError(error, url.pathname)
    }
  }
}

/**
 * 验证必需字段
 */
export function validateRequiredFields(data: any, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })

  if (missingFields.length > 0) {
    throw new ApiError(
      `缺少必需字段: ${missingFields.join(', ')}`,
      400,
      ErrorCode.MISSING_REQUIRED_FIELD,
      { missingFields }
    )
  }
}

/**
 * 验证数据格式
 */
export function validateFormat(value: any, pattern: RegExp, fieldName: string): void {
  if (value && !pattern.test(value)) {
    throw new ApiError(
      `${fieldName}格式不正确`,
      400,
      ErrorCode.INVALID_FORMAT,
      { field: fieldName, value }
    )
  }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): void {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  validateFormat(email, emailPattern, '邮箱地址')
}

/**
 * 验证手机号格式
 */
export function validatePhone(phone: string): void {
  const phonePattern = /^1[3-9]\d{9}$/
  validateFormat(phone, phonePattern, '手机号码')
}

/**
 * 记录错误到数据库
 */
export async function logErrorToDatabase(error: any, context?: any): Promise<void> {
  try {
    // 这里可以将错误记录到数据库
    // 为了避免循环依赖，这里只是示例
    console.error('Error logged:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    })
  } catch (logError) {
    console.error('Failed to log error to database:', logError)
  }
}
