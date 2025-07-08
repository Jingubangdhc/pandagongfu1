"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Video,
  DollarSign,
  TrendingUp,
  Eye,
  ShoppingCart,
  UserPlus,
  Upload,
  FolderTree,
  Tag
} from 'lucide-react'
import { FileUpload } from '@/components/admin/file-upload'
import { FileManager } from '@/components/admin/file-manager'
import { VideoManager } from '@/components/admin/video-manager'
import CategoryManager from '@/components/admin/category-manager'
import TagManager from '@/components/admin/tag-manager'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { formatPrice } from '@/lib/utils'

// 模拟数据
const mockStats = {
  totalUsers: 1234,
  totalVideos: 89,
  totalRevenue: 45678,
  totalOrders: 567,
  newUsersToday: 23,
  videosWatchedToday: 156,
  revenueToday: 1234,
  ordersToday: 12
}

const mockRecentOrders = [
  {
    id: '1',
    user: '张三',
    video: '零基础学习太极拳入门课程',
    amount: 99,
    status: 'completed',
    createdAt: '2024-01-15 14:30'
  },
  {
    id: '2',
    user: '李四',
    video: '高级太极拳技巧提升',
    amount: 199,
    status: 'pending',
    createdAt: '2024-01-15 13:45'
  },
  {
    id: '3',
    user: '王五',
    video: '太极拳养生保健课程',
    amount: 149,
    status: 'completed',
    createdAt: '2024-01-15 12:20'
  }
]

const mockRecentUsers = [
  {
    id: '1',
    username: '新用户001',
    email: 'user001@example.com',
    role: 'USER',
    createdAt: '2024-01-15 15:30',
    referredBy: '推广员A'
  },
  {
    id: '2',
    username: '新用户002',
    email: 'user002@example.com',
    role: 'USER',
    createdAt: '2024-01-15 14:15',
    referredBy: null
  },
  {
    id: '3',
    username: '新用户003',
    email: 'user003@example.com',
    role: 'USER',
    createdAt: '2024-01-15 13:45',
    referredBy: '推广员B'
  }
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockStats)
  const [recentOrders, setRecentOrders] = useState(mockRecentOrders)
  const [recentUsers, setRecentUsers] = useState(mockRecentUsers)

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">管理后台</h1>
          <p className="text-muted-foreground">
            系统概览和管理功能
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                今日新增 +{stats.newUsersToday}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">视频总数</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                今日观看 {stats.videosWatchedToday} 次
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总收入</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                今日收入 {formatPrice(stats.revenueToday)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">订单总数</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                今日订单 +{stats.ordersToday}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="categories">分类管理</TabsTrigger>
            <TabsTrigger value="tags">标签管理</TabsTrigger>
            <TabsTrigger value="videos">视频管理</TabsTrigger>
            <TabsTrigger value="orders">订单管理</TabsTrigger>
            <TabsTrigger value="commissions">佣金管理</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 最近订单 */}
              <Card>
                <CardHeader>
                  <CardTitle>最近订单</CardTitle>
                  <CardDescription>最新的购买订单</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{order.user}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {order.video}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.createdAt}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium">{formatPrice(order.amount)}</p>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {order.status === 'completed' ? '已完成' : '待处理'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 最近用户 */}
              <Card>
                <CardHeader>
                  <CardTitle>最近注册用户</CardTitle>
                  <CardDescription>新注册的用户</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.createdAt}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="outline">{user.role}</Badge>
                          {user.referredBy && (
                            <p className="text-xs text-muted-foreground">
                              推荐人: {user.referredBy}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
                <CardDescription>管理系统用户和权限</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">用户管理功能开发中...</p>
                  <Button variant="outline">查看用户列表</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="tags">
            <TagManager />
          </TabsContent>

          <TabsContent value="videos">
            <VideoManager />
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>订单管理</CardTitle>
                <CardDescription>查看和管理所有订单</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">订单管理功能开发中...</p>
                  <Button variant="outline">查看所有订单</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>佣金管理</CardTitle>
                <CardDescription>管理分销佣金和提现</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">佣金管理功能开发中...</p>
                  <div className="space-x-2">
                    <Button variant="outline">佣金统计</Button>
                    <Button variant="outline">提现管理</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
