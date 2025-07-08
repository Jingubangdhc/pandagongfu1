'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, Star, Clock, Users, BookOpen, Award, TrendingUp, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 检查用户登录状态
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // 模拟数据
  const stats = {
    coursesEnrolled: 3,
    coursesCompleted: 1,
    totalStudyTime: 12.5,
    currentStreak: 7
  }

  const recentCourses = [
    {
      id: 1,
      title: '太极拳入门基础',
      progress: 75,
      lastWatched: '2024-01-15',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: '八段锦养生功法',
      progress: 100,
      lastWatched: '2024-01-14',
      thumbnail: '/api/placeholder/300/200'
    },
    {
      id: 3,
      title: '内功心法秘传',
      progress: 25,
      lastWatched: '2024-01-13',
      thumbnail: '/api/placeholder/300/200'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">慧</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Pandagongfu-慧
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              首页
            </Link>
            <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">
              课程
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-primary">
              学习中心
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">欢迎回来，{user.name}！</h1>
          <p className="text-muted-foreground">继续您的武学修炼之旅</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已报名课程</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.coursesEnrolled}</div>
              <p className="text-xs text-muted-foreground">
                +1 本月新增
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成课程</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
              <p className="text-xs text-muted-foreground">
                完成率 {Math.round((stats.coursesCompleted / stats.coursesEnrolled) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">学习时长</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudyTime}h</div>
              <p className="text-xs text-muted-foreground">
                本月累计
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">连续学习</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak}天</div>
              <p className="text-xs text-muted-foreground">
                保持良好习惯
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 最近学习 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>最近学习</CardTitle>
                <CardDescription>继续您的学习进度</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentCourses.map(course => (
                  <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{course.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={course.progress} className="flex-1" />
                        <span className="text-sm text-muted-foreground">{course.progress}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        最后学习：{course.lastWatched}
                      </p>
                    </div>
                    <Button size="sm">
                      {course.progress === 100 ? '复习' : '继续学习'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 推荐课程 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>推荐课程</CardTitle>
                <CardDescription>基于您的学习偏好</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="aspect-video bg-gradient-to-br from-green-500 to-teal-600 rounded mb-3 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-medium mb-2">五禽戏完整教学</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    华佗五禽戏完整套路教学
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">¥179</span>
                    <Button size="sm">查看详情</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 rounded mb-3 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-medium mb-2">武当剑法基础</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    武当派经典剑法入门
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">¥259</span>
                    <Button size="sm">查看详情</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/courses">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <BookOpen className="h-6 w-6 mb-2" />
                    浏览课程
                  </Button>
                </Link>
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  我的推广
                </Button>
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Award className="h-6 w-6 mb-2" />
                  学习证书
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
