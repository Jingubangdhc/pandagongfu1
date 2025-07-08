import { useState, useEffect, useCallback } from 'react'

interface VideoProgress {
  id?: string
  videoId: string
  currentTime: number
  totalTime: number
  progressPercent: number
  isCompleted: boolean
  lastWatchedAt: string | null
  completedAt: string | null
}

interface ChapterProgress {
  id?: string
  chapterId: string
  currentTime: number
  totalTime: number
  progressPercent: number
  isCompleted: boolean
  lastWatchedAt: string | null
  completedAt: string | null
}

interface LearningStats {
  overview: {
    totalPurchasedVideos: number
    completedVideos: number
    inProgressVideos: number
    completionRate: number
    totalWatchTime: number
    weeklyWatchTime: number
    learningStreak: number
  }
  recentlyWatched: Array<{
    id: string
    title: string
    thumbnail: string
    duration: number
    instructor: string
    progress: {
      currentTime: number
      progressPercent: number
      isCompleted: boolean
      lastWatchedAt: string
    }
  }>
  videosWithProgress: Array<{
    id: string
    title: string
    thumbnail: string
    duration: number
    instructor: string
    category: string
    purchasedAt: string
    progress: VideoProgress
  }>
}

export function useVideoProgress(videoId: string) {
  const [progress, setProgress] = useState<VideoProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取视频进度
  const fetchProgress = useCallback(async () => {
    if (!videoId) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('未登录')
        return
      }

      const response = await fetch(`/api/progress/video?videoId=${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '获取进度失败')
      }
    } catch (err) {
      setError('网络错误')
      console.error('Fetch video progress error:', err)
    } finally {
      setLoading(false)
    }
  }, [videoId])

  // 更新视频进度
  const updateProgress = useCallback(async (currentTime: number, totalTime: number) => {
    if (!videoId) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('未登录')
        return
      }

      const response = await fetch('/api/progress/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoId,
          currentTime,
          totalTime
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
        setError(null)
        return data.progress
      } else {
        const errorData = await response.json()
        setError(errorData.error || '更新进度失败')
      }
    } catch (err) {
      setError('网络错误')
      console.error('Update video progress error:', err)
    }
  }, [videoId])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return {
    progress,
    loading,
    error,
    updateProgress,
    refetch: fetchProgress
  }
}

export function useChapterProgress(chapterId?: string, videoId?: string) {
  const [progress, setProgress] = useState<ChapterProgress | ChapterProgress[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取章节进度
  const fetchProgress = useCallback(async () => {
    if (!chapterId && !videoId) return

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('未登录')
        return
      }

      const params = new URLSearchParams()
      if (chapterId) params.append('chapterId', chapterId)
      if (videoId) params.append('videoId', videoId)

      const response = await fetch(`/api/progress/chapter?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '获取进度失败')
      }
    } catch (err) {
      setError('网络错误')
      console.error('Fetch chapter progress error:', err)
    } finally {
      setLoading(false)
    }
  }, [chapterId, videoId])

  // 更新章节进度
  const updateProgress = useCallback(async (chapterIdToUpdate: string, currentTime: number, totalTime: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('未登录')
        return
      }

      const response = await fetch('/api/progress/chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chapterId: chapterIdToUpdate,
          currentTime,
          totalTime
        })
      })

      if (response.ok) {
        const data = await response.json()
        // 如果是单个章节，直接更新；如果是多个章节，需要重新获取
        if (chapterId) {
          setProgress(data.progress)
        } else {
          fetchProgress() // 重新获取所有章节进度
        }
        setError(null)
        return data.progress
      } else {
        const errorData = await response.json()
        setError(errorData.error || '更新进度失败')
      }
    } catch (err) {
      setError('网络错误')
      console.error('Update chapter progress error:', err)
    }
  }, [chapterId, fetchProgress])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return {
    progress,
    loading,
    error,
    updateProgress,
    refetch: fetchProgress
  }
}

export function useLearningStats() {
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取学习统计
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('未登录')
        return
      }

      const response = await fetch('/api/progress/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '获取统计数据失败')
      }
    } catch (err) {
      setError('网络错误')
      console.error('Fetch learning stats error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

// 格式化时间的工具函数
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

// 格式化学习时长的工具函数
export function formatLearningTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟`
  } else {
    return '不到1分钟'
  }
}
