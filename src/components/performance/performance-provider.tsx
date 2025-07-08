'use client'

import { useEffect } from 'react'
import { initPerformanceMonitoring } from '@/lib/performance'

interface PerformanceProviderProps {
  children: React.ReactNode
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useEffect(() => {
    // 初始化性能监控
    initPerformanceMonitoring()

    // 预加载关键资源
    const preloadCriticalResources = () => {
      // 预加载关键字体
      const fontLink = document.createElement('link')
      fontLink.rel = 'preload'
      fontLink.as = 'font'
      fontLink.type = 'font/woff2'
      fontLink.crossOrigin = 'anonymous'
      fontLink.href = '/fonts/inter-var.woff2' // 根据实际字体路径调整
      document.head.appendChild(fontLink)

      // 预加载关键CSS
      const criticalCSS = document.createElement('link')
      criticalCSS.rel = 'preload'
      criticalCSS.as = 'style'
      criticalCSS.href = '/styles/critical.css' // 如果有关键CSS文件
      document.head.appendChild(criticalCSS)
    }

    // 延迟执行预加载，避免阻塞关键渲染路径
    setTimeout(preloadCriticalResources, 100)

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 页面变为可见时，记录性能指标
        const now = performance.now()
        console.log('Page became visible at:', now)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 监听网络状态变化
    const handleOnline = () => {
      console.log('Network status: online')
    }

    const handleOffline = () => {
      console.log('Network status: offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 清理函数
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return <>{children}</>
}

// 性能调试组件（仅在开发环境显示）
export function PerformanceDebugger() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // 创建性能调试面板
    const debugPanel = document.createElement('div')
    debugPanel.id = 'performance-debug'
    debugPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
      display: none;
    `

    document.body.appendChild(debugPanel)

    // 显示/隐藏调试面板的快捷键
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        const panel = document.getElementById('performance-debug')
        if (panel) {
          panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
          
          if (panel.style.display === 'block') {
            updateDebugInfo()
          }
        }
      }
    }

    // 更新调试信息
    const updateDebugInfo = () => {
      const panel = document.getElementById('performance-debug')
      if (!panel || panel.style.display === 'none') return

      const navigation = typeof performance !== 'undefined' && performance.getEntriesByType
        ? performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        : null
      const paint = typeof performance !== 'undefined' && performance.getEntriesByType
        ? performance.getEntriesByType('paint')
        : []
      
      let info = '<strong>Performance Debug (Ctrl+Shift+P to toggle)</strong><br>'
      
      if (navigation) {
        info += `DOM Content Loaded: ${Math.round(navigation.domContentLoadedEventEnd - navigation.loadEventStart)}ms<br>`
        info += `Load Complete: ${Math.round(navigation.loadEventEnd - navigation.loadEventStart)}ms<br>`
        info += `DNS Lookup: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms<br>`
        info += `TCP Connect: ${Math.round(navigation.connectEnd - navigation.connectStart)}ms<br>`
      }
      
      paint.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          info += `FCP: ${Math.round(entry.startTime)}ms<br>`
        }
      })
      
      // 内存使用情况（如果支持）
      if ('memory' in performance) {
        const memory = (performance as any).memory
        info += `JS Heap: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB<br>`
      }
      
      // 连接信息（如果支持）
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        info += `Connection: ${connection.effectiveType}<br>`
        info += `Downlink: ${connection.downlink}Mbps<br>`
      }
      
      panel.innerHTML = info
    }

    document.addEventListener('keydown', handleKeyPress)

    // 定期更新调试信息
    const debugInterval = setInterval(updateDebugInfo, 1000)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      clearInterval(debugInterval)
      const panel = document.getElementById('performance-debug')
      if (panel) {
        document.body.removeChild(panel)
      }
    }
  }, [])

  return null
}

// 资源预加载组件
export function ResourcePreloader({ resources }: { resources: string[] }) {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      
      // 根据文件扩展名确定资源类型
      if (resource.endsWith('.js')) {
        link.as = 'script'
      } else if (resource.endsWith('.css')) {
        link.as = 'style'
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
        link.as = 'image'
      } else if (resource.match(/\.(woff|woff2|ttf|eot)$/i)) {
        link.as = 'font'
        link.crossOrigin = 'anonymous'
      } else {
        link.as = 'fetch'
        link.crossOrigin = 'anonymous'
      }
      
      link.href = resource
      document.head.appendChild(link)
    })
  }, [resources])

  return null
}

// 关键CSS内联组件
export function CriticalCSS({ css }: { css: string }) {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = css
    style.setAttribute('data-critical', 'true')
    document.head.appendChild(style)

    return () => {
      const criticalStyles = document.querySelectorAll('style[data-critical="true"]')
      criticalStyles.forEach(style => style.remove())
    }
  }, [css])

  return null
}
