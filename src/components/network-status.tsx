'use client'

import React from 'react'
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react'
import { useNetworkStatusDisplay } from '@/hooks/useNetworkStatus'

/**
 * 网络状态指示器组件
 * 显示当前网络连接状态和连接质量
 */
export function NetworkStatusIndicator() {
  const { networkStatus, showOfflineMessage } = useNetworkStatusDisplay()

  if (!showOfflineMessage && networkStatus.isOnline) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {!networkStatus.isOnline ? (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">网络连接已断开</span>
        </div>
      ) : networkStatus.isSlowConnection ? (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">网络连接较慢</span>
        </div>
      ) : showOfflineMessage ? (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">网络连接已恢复</span>
        </div>
      ) : null}
    </div>
  )
}

/**
 * 离线提示横幅组件
 */
export function OfflineBanner() {
  const { networkStatus } = useNetworkStatusDisplay()

  if (networkStatus.isOnline) {
    return null
  }

  return (
    <div className="bg-red-600 text-white py-2 px-4 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>您当前处于离线状态，某些功能可能无法正常使用</span>
      </div>
    </div>
  )
}

/**
 * 网络状态详情组件（调试用）
 */
export function NetworkStatusDetails() {
  const { networkStatus } = useNetworkStatusDisplay()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="flex items-center gap-2 mb-2">
        {networkStatus.isOnline ? (
          <Wifi className="w-4 h-4 text-green-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-400" />
        )}
        <span className="font-semibold">网络状态</span>
      </div>
      
      <div className="space-y-1">
        <div>在线: {networkStatus.isOnline ? '是' : '否'}</div>
        <div>慢速连接: {networkStatus.isSlowConnection ? '是' : '否'}</div>
        <div>连接类型: {networkStatus.connectionType}</div>
        <div>有效类型: {networkStatus.effectiveType}</div>
      </div>
    </div>
  )
}

/**
 * 网络错误重试组件
 */
interface NetworkErrorRetryProps {
  error: any
  onRetry: () => void
  loading?: boolean
}

export function NetworkErrorRetry({ error, onRetry, loading = false }: NetworkErrorRetryProps) {
  const { networkStatus } = useNetworkStatusDisplay()

  const getErrorMessage = () => {
    if (!networkStatus.isOnline) {
      return '网络连接已断开，请检查您的网络设置后重试'
    }

    if (error?.message?.includes('timeout')) {
      return '请求超时，请稍后重试'
    }

    if (error?.status >= 500) {
      return '服务器暂时不可用，请稍后重试'
    }

    return '网络请求失败，请检查网络连接后重试'
  }

  const getErrorIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff className="w-8 h-8 text-red-500" />
    }
    return <AlertTriangle className="w-8 h-8 text-yellow-500" />
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        {getErrorIcon()}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        网络连接问题
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {getErrorMessage()}
      </p>

      <button
        onClick={onRetry}
        disabled={loading || !networkStatus.isOnline}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            重试中...
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            重试
          </>
        )}
      </button>

      {!networkStatus.isOnline && (
        <p className="text-sm text-gray-500 mt-4">
          请检查网络连接后点击重试
        </p>
      )}
    </div>
  )
}

/**
 * 网络状态提供者组件
 * 在应用顶层使用，提供全局网络状态显示
 */
export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NetworkStatusIndicator />
      <OfflineBanner />
      <NetworkStatusDetails />
    </>
  )
}
