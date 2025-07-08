"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, PlayCircle, Calendar } from "lucide-react"
import { formatDuration, formatLearningTime } from "@/hooks/useProgress"

interface ProgressCardProps {
  video: {
    id: string
    title: string
    thumbnail: string
    duration: number
    instructor: string
    category: string
    purchasedAt: string
    progress: {
      currentTime: number
      totalTime: number
      progressPercent: number
      isCompleted: boolean
      lastWatchedAt: string | null
      completedAt: string | null
    }
  }
  onClick?: () => void
}

export function ProgressCard({ video, onClick }: ProgressCardProps) {
  const { progress } = video
  const isStarted = progress.progressPercent > 0
  const completionDate = progress.completedAt ? new Date(progress.completedAt) : null
  const lastWatchedDate = progress.lastWatchedAt ? new Date(progress.lastWatchedAt) : null

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="relative">
            <img
              src={video.thumbnail || '/api/placeholder/120/80'}
              alt={video.title}
              className="w-16 h-12 md:w-20 md:h-14 object-cover rounded-md"
            />
            {progress.isCompleted && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
            {isStarted && !progress.isCompleted && (
              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                <PlayCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xs md:text-sm font-medium line-clamp-2 mb-1">
              {video.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mb-1 md:mb-2">
              {video.instructor} • {video.category}
            </p>
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Badge
                variant={progress.isCompleted ? "default" : isStarted ? "secondary" : "outline"}
                className="text-xs"
              >
                {progress.isCompleted ? "已完成" : isStarted ? "学习中" : "未开始"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress.progressPercent)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 md:px-6">
        {/* 进度条 */}
        <div className="mb-2 md:mb-3">
          <Progress
            value={progress.progressPercent}
            className="h-1.5 md:h-2"
          />
        </div>

        {/* 时间信息 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 md:mb-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {formatDuration(progress.currentTime)} / {formatDuration(video.duration)}
            </span>
          </div>
          <span>
            剩余 {formatLearningTime(video.duration - progress.currentTime)}
          </span>
        </div>

        {/* 学习状态信息 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {progress.isCompleted && completionDate ? (
              <span>完成于 {completionDate.toLocaleDateString()}</span>
            ) : lastWatchedDate ? (
              <span>上次学习 {lastWatchedDate.toLocaleDateString()}</span>
            ) : (
              <span>购买于 {new Date(video.purchasedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface LearningStatsCardProps {
  stats: {
    totalPurchasedVideos: number
    completedVideos: number
    inProgressVideos: number
    completionRate: number
    totalWatchTime: number
    weeklyWatchTime: number
    learningStreak: number
  }
}

export function LearningStatsCard({ stats }: LearningStatsCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-blue-600">
            {stats.totalPurchasedVideos}
          </div>
          <p className="text-xs text-muted-foreground">购买课程</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-green-600">
            {stats.completedVideos}
          </div>
          <p className="text-xs text-muted-foreground">已完成</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-orange-600">
            {stats.inProgressVideos}
          </div>
          <p className="text-xs text-muted-foreground">学习中</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-purple-600">
            {stats.completionRate}%
          </div>
          <p className="text-xs text-muted-foreground">完成率</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-indigo-600">
            {formatLearningTime(stats.totalWatchTime)}
          </div>
          <p className="text-xs text-muted-foreground">总学习时长</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-teal-600">
            {formatLearningTime(stats.weeklyWatchTime)}
          </div>
          <p className="text-xs text-muted-foreground">本周学习</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-red-600">
            {stats.learningStreak}
          </div>
          <p className="text-xs text-muted-foreground">连续学习天数</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-gray-600">
            {stats.totalPurchasedVideos - stats.completedVideos - stats.inProgressVideos}
          </div>
          <p className="text-xs text-muted-foreground">未开始</p>
        </CardContent>
      </Card>
    </div>
  )
}

interface RecentlyWatchedProps {
  videos: Array<{
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
  onVideoClick?: (videoId: string) => void
}

export function RecentlyWatched({ videos, onVideoClick }: RecentlyWatchedProps) {
  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>还没有学习记录</p>
          <p className="text-sm">开始学习您的第一个课程吧！</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onVideoClick?.(video.id)}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <img
                  src={video.thumbnail || '/api/placeholder/80/60'}
                  alt={video.title}
                  className="w-12 h-9 md:w-16 md:h-12 object-cover rounded"
                />
                {video.progress.isCompleted && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-xs md:text-sm line-clamp-1 mb-1">
                  {video.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-1 md:mb-2">
                  {video.instructor}
                </p>
                <div className="flex items-center justify-between">
                  <Progress
                    value={video.progress.progressPercent}
                    className="h-1 md:h-1.5 flex-1 mr-2"
                  />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(video.progress.progressPercent)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
