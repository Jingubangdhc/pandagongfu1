// 懒加载组件导出文件
import dynamic from 'next/dynamic'
import React, { ComponentType } from 'react'

// 加载状态组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

const LoadingCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-48 w-full mb-4"></div>
    <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
    <div className="bg-gray-200 rounded h-4 w-1/2"></div>
  </div>
)

// 懒加载的重型组件
// 暂时禁用缺失的组件
// export const LazyVideoPlayer = dynamic(
//   () => import('@/components/video/video-player'),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false, // 视频播放器不需要 SSR
//   }
// )

// export const LazyVideoManager = dynamic(
//   () => import('@/components/admin/video-manager'),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false, // 管理界面不需要 SSR
//   }
// )

// export const LazyFileManager = dynamic(
//   () => import('@/components/admin/file-manager'),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// )

// export const LazyCommissionDashboard = dynamic(
//   () => import('@/components/commission/commission-dashboard'),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// )

// export const LazyWithdrawalForm = dynamic(
//   () => import('@/components/commission/withdrawal-form'),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// )

// export const LazyLearningDashboard = dynamic(
//   () => import('@/components/learning/learning-dashboard'),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// )

// export const LazyProgressCard = dynamic(
//   () => import('@/components/learning/progress-card'),
//   {
//     loading: () => <LoadingCard />,
//     ssr: true, // 进度卡片需要 SSR 以提高 SEO
//   }
// )

export const LazyVideoCard = dynamic(
  () => import('@/components/video/video-card').then(mod => ({ default: mod.VideoCard })),
  {
    loading: () => <LoadingCard />,
    ssr: true, // 视频卡片需要 SSR 以提高 SEO
  }
)

// 条件懒加载 - 仅在需要时加载
export const LazyChartComponents = {
  LineChart: dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }),
  BarChart: dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }),
  PieChart: dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }),
}

// 第三方库懒加载 (暂时禁用)
// export const LazyReactDropzone = dynamic(
//   () => import('react-dropzone'),
//   {
//     loading: () => <LoadingSpinner />,
//     ssr: false,
//   }
// )

// 高阶组件：为任何组件添加懒加载
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    loading?: ComponentType
    ssr?: boolean
  } = {}
) {
  return dynamic(importFn, {
    loading: options.loading ? () => React.createElement(options.loading!) : () => <LoadingSpinner />,
    ssr: options.ssr ?? true,
  })
}

// 预加载函数 - 在用户可能需要之前预加载组件
export const preloadComponents = {
  // videoPlayer: () => import('@/components/video/video-player'), // Component not found
  adminDashboard: () => import('@/components/admin/video-manager'),
  // commissionDashboard: () => import('@/components/commission/commission-dashboard'), // Component not found
  // learningDashboard: () => import('@/components/learning/learning-dashboard'), // Component not found
}

// 智能预加载 Hook
export function useSmartPreload() {
  const preloadOnHover = (componentKey: keyof typeof preloadComponents) => {
    return {
      onMouseEnter: () => {
        preloadComponents[componentKey]()
      }
    }
  }

  const preloadOnVisible = (componentKey: keyof typeof preloadComponents) => {
    // 可以结合 Intersection Observer 实现
    return () => {
      preloadComponents[componentKey]()
    }
  }

  return { preloadOnHover, preloadOnVisible }
}
