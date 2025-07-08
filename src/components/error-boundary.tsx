'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * 全局错误边界组件
 * 捕获React组件树中的JavaScript错误，记录错误并显示用户友好的错误界面
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新state以显示错误UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 更新state
    this.setState({
      error,
      errorInfo
    })

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 发送错误到监控服务（生产环境）
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo)
    }
  }

  /**
   * 将错误发送到监控服务
   */
  private logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // 这里可以集成错误监控服务，如 Sentry, LogRocket 等
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      // 发送到错误监控API
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      }).catch(err => {
        console.error('Failed to log error to service:', err)
      })
    } catch (err) {
      console.error('Error in logErrorToService:', err)
    }
  }

  /**
   * 重置错误状态
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  /**
   * 刷新页面
   */
  handleRefresh = () => {
    window.location.reload()
  }

  /**
   * 返回首页
   */
  handleGoHome = () => {
    window.location.href = '/'
  }

  /**
   * 报告错误
   */
  handleReportError = () => {
    const { error, errorInfo } = this.state
    const errorReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    // 复制错误信息到剪贴板
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('错误信息已复制到剪贴板，请联系技术支持')
      })
      .catch(() => {
        alert('无法复制错误信息，请手动记录错误详情')
      })
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            {/* 错误图标 */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* 错误标题 */}
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              哎呀，出现了一些问题
            </h1>

            {/* 错误描述 */}
            <p className="text-gray-600 mb-6">
              应用程序遇到了意外错误。我们已经记录了这个问题，正在努力修复。
            </p>

            {/* 错误详情（开发环境） */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">错误详情：</h3>
                <p className="text-sm text-red-600 font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      查看堆栈跟踪
                    </summary>
                    <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重试
              </button>

              <div className="flex gap-3">
                <button
                  onClick={this.handleRefresh}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新页面
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  返回首页
                </button>
              </div>

              <button
                onClick={this.handleReportError}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <Bug className="w-4 h-4" />
                报告错误
              </button>
            </div>

            {/* 帮助信息 */}
            <p className="text-xs text-gray-500 mt-4">
              如果问题持续存在，请联系技术支持或尝试清除浏览器缓存
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary
