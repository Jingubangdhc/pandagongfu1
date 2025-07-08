'use client'

import React from 'react'
import { AlertCircle, XCircle, AlertTriangle, Info, X, RefreshCw } from 'lucide-react'

export type ErrorType = 'error' | 'warning' | 'info' | 'success'

interface ErrorMessageProps {
  type?: ErrorType
  title?: string
  message: string
  details?: string
  onClose?: () => void
  onRetry?: () => void
  retryText?: string
  showRetry?: boolean
  className?: string
}

/**
 * 用户友好的错误消息组件
 * 将技术错误转换为用户可理解的消息
 */
export function ErrorMessage({
  type = 'error',
  title,
  message,
  details,
  onClose,
  onRetry,
  retryText = '重试',
  showRetry = false,
  className = ''
}: ErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'success':
        return <AlertCircle className="w-5 h-5 text-green-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      case 'success':
        return 'text-green-800'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getBackgroundColor()} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold ${getTextColor()} mb-1`}>
              {title}
            </h3>
          )}
          
          <p className={`text-sm ${getTextColor()}`}>
            {message}
          </p>
          
          {details && (
            <details className="mt-2">
              <summary className={`text-xs cursor-pointer ${getTextColor()} opacity-75 hover:opacity-100`}>
                查看详细信息
              </summary>
              <pre className={`text-xs ${getTextColor()} mt-2 p-2 bg-white bg-opacity-50 rounded overflow-auto max-h-32`}>
                {details}
              </pre>
            </details>
          )}
          
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {retryText}
            </button>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded-md hover:bg-white hover:bg-opacity-50 transition-colors ${getTextColor()}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * 错误消息转换工具
 * 将技术错误转换为用户友好的消息
 */
export function translateError(error: any): { title: string; message: string; type: ErrorType } {
  // 网络错误
  if (!navigator.onLine) {
    return {
      title: '网络连接问题',
      message: '您的设备似乎已断开网络连接，请检查网络设置后重试。',
      type: 'error'
    }
  }

  // 超时错误
  if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    return {
      title: '请求超时',
      message: '服务器响应时间过长，请稍后重试。如果问题持续存在，请联系技术支持。',
      type: 'warning'
    }
  }

  // 服务器错误
  if (error?.status >= 500) {
    return {
      title: '服务器错误',
      message: '服务器暂时不可用，我们正在努力修复。请稍后重试。',
      type: 'error'
    }
  }

  // 认证错误
  if (error?.status === 401) {
    return {
      title: '身份验证失败',
      message: '您的登录状态已过期，请重新登录后继续操作。',
      type: 'warning'
    }
  }

  // 权限错误
  if (error?.status === 403) {
    return {
      title: '权限不足',
      message: '您没有执行此操作的权限，请联系管理员获取帮助。',
      type: 'warning'
    }
  }

  // 资源不存在
  if (error?.status === 404) {
    return {
      title: '资源不存在',
      message: '您访问的内容不存在或已被删除。',
      type: 'info'
    }
  }

  // 请求错误
  if (error?.status >= 400 && error?.status < 500) {
    return {
      title: '请求错误',
      message: '请求信息有误，请检查输入内容后重试。',
      type: 'warning'
    }
  }

  // 文件上传错误
  if (error?.message?.includes('file') || error?.message?.includes('upload')) {
    return {
      title: '文件上传失败',
      message: '文件上传过程中出现问题，请检查文件格式和大小后重试。',
      type: 'error'
    }
  }

  // 支付错误
  if (error?.message?.includes('payment') || error?.message?.includes('pay')) {
    return {
      title: '支付处理失败',
      message: '支付过程中出现问题，请检查支付信息后重试。如果问题持续存在，请联系客服。',
      type: 'error'
    }
  }

  // 表单验证错误
  if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
    return {
      title: '输入信息有误',
      message: '请检查表单中的输入信息，确保所有必填项都已正确填写。',
      type: 'warning'
    }
  }

  // 默认错误
  return {
    title: '操作失败',
    message: '操作过程中出现了意外错误，请稍后重试。如果问题持续存在，请联系技术支持。',
    type: 'error'
  }
}

/**
 * 错误消息容器组件
 * 用于显示多个错误消息
 */
interface ErrorMessageContainerProps {
  errors: Array<{
    id: string
    error: any
    onRetry?: () => void
  }>
  onDismiss: (id: string) => void
  className?: string
}

export function ErrorMessageContainer({ errors, onDismiss, className = '' }: ErrorMessageContainerProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {errors.map(({ id, error, onRetry }) => {
        const { title, message, type } = translateError(error)
        
        return (
          <ErrorMessage
            key={id}
            type={type}
            title={title}
            message={message}
            details={process.env.NODE_ENV === 'development' ? error?.stack || error?.message : undefined}
            onClose={() => onDismiss(id)}
            onRetry={onRetry}
            showRetry={!!onRetry}
          />
        )
      })}
    </div>
  )
}
