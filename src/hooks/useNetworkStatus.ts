'use client'

import { useState, useEffect, useCallback } from 'react'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string
  effectiveType: string
}

interface NetworkError {
  type: 'network' | 'timeout' | 'server' | 'unknown'
  message: string
  retryable: boolean
}

/**
 * 网络状态监控Hook
 * 监控网络连接状态、连接质量和网络错误
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown'
  })

  const [retryQueue, setRetryQueue] = useState<Array<() => Promise<any>>>([])

  // 检测网络连接状态
  const updateNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine
    let connectionType = 'unknown'
    let effectiveType = 'unknown'
    let isSlowConnection = false

    // 检测连接类型（如果支持）
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connectionType = connection.type || connection.effectiveType || 'unknown'
      effectiveType = connection.effectiveType || 'unknown'
      
      // 判断是否为慢速连接
      isSlowConnection = ['slow-2g', '2g'].includes(effectiveType) ||
                        (connection.downlink && connection.downlink < 1.5)
    }

    setNetworkStatus({
      isOnline,
      isSlowConnection,
      connectionType,
      effectiveType
    })
  }, [])

  // 网络状态变化监听
  useEffect(() => {
    const handleOnline = () => {
      updateNetworkStatus()
      // 网络恢复时执行重试队列
      executeRetryQueue()
    }

    const handleOffline = () => {
      updateNetworkStatus()
    }

    const handleConnectionChange = () => {
      updateNetworkStatus()
    }

    // 添加事件监听器
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 监听连接变化（如果支持）
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', handleConnectionChange)
    }

    // 初始化网络状态
    updateNetworkStatus()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [updateNetworkStatus])

  // 执行重试队列
  const executeRetryQueue = useCallback(async () => {
    if (retryQueue.length === 0 || !networkStatus.isOnline) return

    const queue = [...retryQueue]
    setRetryQueue([])

    for (const retryFn of queue) {
      try {
        await retryFn()
      } catch (error) {
        console.error('Retry failed:', error)
      }
    }
  }, [retryQueue, networkStatus.isOnline])

  // 添加到重试队列
  const addToRetryQueue = useCallback((retryFn: () => Promise<any>) => {
    setRetryQueue(prev => [...prev, retryFn])
  }, [])

  // 分析网络错误类型
  const analyzeNetworkError = useCallback((error: any): NetworkError => {
    if (!navigator.onLine) {
      return {
        type: 'network',
        message: '网络连接已断开，请检查您的网络设置',
        retryable: true
      }
    }

    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return {
        type: 'timeout',
        message: '请求超时，请稍后重试',
        retryable: true
      }
    }

    if (error.status >= 500 && error.status < 600) {
      return {
        type: 'server',
        message: '服务器暂时不可用，请稍后重试',
        retryable: true
      }
    }

    if (error.status >= 400 && error.status < 500) {
      return {
        type: 'server',
        message: '请求错误，请检查输入信息',
        retryable: false
      }
    }

    return {
      type: 'unknown',
      message: '发生未知错误，请稍后重试',
      retryable: true
    }
  }, [])

  // 网络请求重试逻辑
  const retryRequest = useCallback(async (
    requestFn: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<any> => {
    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error
        
        const networkError = analyzeNetworkError(error)
        
        // 如果不可重试或已达到最大重试次数，抛出错误
        if (!networkError.retryable || attempt === maxRetries) {
          throw error
        }

        // 如果网络断开，添加到重试队列
        if (!navigator.onLine) {
          return new Promise((resolve, reject) => {
            addToRetryQueue(async () => {
              try {
                const result = await requestFn()
                resolve(result)
              } catch (retryError) {
                reject(retryError)
              }
            })
          })
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
      }
    }

    throw lastError
  }, [analyzeNetworkError, addToRetryQueue])

  return {
    networkStatus,
    analyzeNetworkError,
    retryRequest,
    addToRetryQueue,
    retryQueueLength: retryQueue.length
  }
}

/**
 * 网络状态显示组件Hook
 */
export function useNetworkStatusDisplay() {
  const { networkStatus } = useNetworkStatus()
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    if (!networkStatus.isOnline) {
      setShowOfflineMessage(true)
    } else {
      // 网络恢复时延迟隐藏消息
      const timer = setTimeout(() => {
        setShowOfflineMessage(false)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [networkStatus.isOnline])

  return {
    networkStatus,
    showOfflineMessage
  }
}
