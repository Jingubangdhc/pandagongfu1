// 性能监控工具
'use client'

// 性能指标接口
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url?: string
  userAgent?: string
}

// 性能监控类
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 初始化性能监控
  init(): void {
    if (typeof window === 'undefined') return

    this.observeWebVitals()
    this.observeNavigation()
    this.observeResources()
    this.observeLongTasks()
  }

  // 监控 Web Vitals
  private observeWebVitals(): void {
    // First Contentful Paint (FCP)
    this.observePerformanceEntry('paint', (entries) => {
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime)
        }
      })
    })

    // Largest Contentful Paint (LCP)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        this.recordMetric('LCP', lastEntry.startTime)
      }
    })

    // First Input Delay (FID)
    this.observePerformanceEntry('first-input', (entries) => {
      entries.forEach((entry) => {
        this.recordMetric('FID', (entry as any).processingStart - entry.startTime)
      })
    })

    // Cumulative Layout Shift (CLS)
    this.observePerformanceEntry('layout-shift', (entries) => {
      let clsValue = 0
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      if (clsValue > 0) {
        this.recordMetric('CLS', clsValue)
      }
    })
  }

  // 监控导航性能
  private observeNavigation(): void {
    this.observePerformanceEntry('navigation', (entries) => {
      entries.forEach((entry) => {
        const nav = entry as PerformanceNavigationTiming
        
        // DNS 查询时间
        this.recordMetric('DNS', nav.domainLookupEnd - nav.domainLookupStart)
        
        // TCP 连接时间
        this.recordMetric('TCP', nav.connectEnd - nav.connectStart)
        
        // SSL 握手时间
        if (nav.secureConnectionStart > 0) {
          this.recordMetric('SSL', nav.connectEnd - nav.secureConnectionStart)
        }
        
        // 请求响应时间
        this.recordMetric('Request', nav.responseEnd - nav.requestStart)
        
        // DOM 解析时间
        this.recordMetric('DOM_Parse', nav.domContentLoadedEventEnd - (nav as any).domLoading)

        // 页面加载完成时间
        this.recordMetric('Load_Complete', nav.loadEventEnd - nav.loadEventStart)
      })
    })
  }

  // 监控资源加载性能
  private observeResources(): void {
    this.observePerformanceEntry('resource', (entries) => {
      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming
        const duration = resource.responseEnd - resource.startTime
        
        // 按资源类型分类
        const resourceType = this.getResourceType(resource.name)
        this.recordMetric(`Resource_${resourceType}`, duration, resource.name)
      })
    })
  }

  // 监控长任务
  private observeLongTasks(): void {
    this.observePerformanceEntry('longtask', (entries) => {
      entries.forEach((entry) => {
        this.recordMetric('Long_Task', entry.duration)
      })
    })
  }

  // 通用性能观察器
  private observePerformanceEntry(
    entryType: string,
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      
      observer.observe({ entryTypes: [entryType] })
      this.observers.push(observer)
    } catch (error) {
      console.warn(`无法观察性能指标: ${entryType}`, error)
    }
  }

  // 记录性能指标
  private recordMetric(name: string, value: number, url?: string): void {
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value * 100) / 100, // 保留两位小数
      timestamp: Date.now(),
      url: url || window.location.href,
      userAgent: navigator.userAgent,
    }

    this.metrics.push(metric)
    
    // 限制存储的指标数量
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500)
    }

    // 发送到分析服务
    this.sendMetric(metric)
  }

  // 发送指标到服务器
  private async sendMetric(metric: PerformanceMetric): Promise<void> {
    try {
      // 使用 sendBeacon 或 fetch 发送数据
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/performance', JSON.stringify(metric))
      } else {
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
          keepalive: true,
        }).catch(() => {}) // 忽略错误，避免影响用户体验
      }
    } catch (error) {
      // 静默处理错误
    }
  }

  // 获取资源类型
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'JavaScript'
    if (url.includes('.css')) return 'CSS'
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'Image'
    if (url.match(/\.(mp4|webm|ogg)$/i)) return 'Video'
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'Font'
    return 'Other'
  }

  // 获取性能摘要
  getPerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {}
    
    // 按指标名称分组
    const groupedMetrics = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = []
      acc[metric.name].push(metric.value)
      return acc
    }, {} as Record<string, number[]>)

    // 计算统计信息
    Object.entries(groupedMetrics).forEach(([name, values]) => {
      summary[name] = {
        count: values.length,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p95: this.percentile(values, 95),
      }
    })

    return summary
  }

  // 计算百分位数
  private percentile(values: number[], p: number): number {
    const sorted = values.sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[index] || 0
  }

  // 清理观察器
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  // 获取所有指标
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // 清除指标
  clearMetrics(): void {
    this.metrics = []
  }
}

// 性能监控 Hook
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()

  // 手动记录性能指标
  const recordCustomMetric = (name: string, value: number) => {
    monitor['recordMetric'](name, value)
  }

  // 测量函数执行时间
  const measureFunction = async <T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> => {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      recordCustomMetric(`Function_${name}`, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      recordCustomMetric(`Function_${name}_Error`, duration)
      throw error
    }
  }

  // 测量组件渲染时间
  const measureRender = (componentName: string) => {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      recordCustomMetric(`Render_${componentName}`, duration)
    }
  }

  return {
    recordCustomMetric,
    measureFunction,
    measureRender,
    getPerformanceSummary: () => monitor.getPerformanceSummary(),
    getMetrics: () => monitor.getMetrics(),
    clearMetrics: () => monitor.clearMetrics(),
  }
}

// 初始化性能监控
export function initPerformanceMonitoring(): void {
  if (typeof window !== 'undefined') {
    const monitor = PerformanceMonitor.getInstance()
    monitor.init()

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
      monitor.disconnect()
    })
  }
}

// 性能预算检查
export const performanceBudgets = {
  FCP: 1800, // First Contentful Paint < 1.8s
  LCP: 2500, // Largest Contentful Paint < 2.5s
  FID: 100,  // First Input Delay < 100ms
  CLS: 0.1,  // Cumulative Layout Shift < 0.1
  Load_Complete: 3000, // Page Load < 3s
}

export function checkPerformanceBudget(metrics: PerformanceMetric[]): Record<string, boolean> {
  const results: Record<string, boolean> = {}
  
  Object.entries(performanceBudgets).forEach(([metric, budget]) => {
    const metricValues = metrics.filter(m => m.name === metric).map(m => m.value)
    if (metricValues.length > 0) {
      const avgValue = metricValues.reduce((a, b) => a + b, 0) / metricValues.length
      results[metric] = avgValue <= budget
    }
  })
  
  return results
}
