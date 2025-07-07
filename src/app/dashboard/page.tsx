"use client"

import { useState } from 'react'
import Link from 'next/link'
import { 
  User, 
  BookOpen, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Eye,
  Download,
  Share2,
  Calendar,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useUser } from '@/components/providers'
import { formatPrice } from '@/lib/utils'

// 模拟数据
const dashboardData = {
  stats: {
    totalEarnings: 2580.50,
    monthlyEarnings: 680.30,
    totalReferrals: 45,
    activeCourses: 12,
    totalViews: 1250,
    conversionRate: 8.5
  },
  recentPurchases: [
    {
      id: '1',
      title: '零基础学习太极拳入门课程',
      purchaseDate: '2024-01-20',
      price: 99,
      status: 'completed'
    },
    {
      id: '2',
      title: '养生气功基础教程',
      purchaseDate: '2024-01-18',
      price: 79,
      status: 'completed'
    }
  ],
  recentCommissions: [
    {
      id: '1',
      referralName: '张三',
      courseName: '太极拳入门课程',
      commission: 15.00,
      date: '2024-01-19',
      status: 'paid'
    },
    {
      id: '2',
      referralName: '李四',
      courseName: '气功基础教程',
      commission: 12.00,
      date: '2024-01-17',
      status: 'pending'
    }
  ],
  referralStats: {
    totalClicks: 320,
    conversions: 27,
    conversionRate: 8.4,
    topReferrer: '太极拳入门课程'
  }
}

export default function DashboardPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('overview')

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">请先登录</h2>
            <p className="text-muted-foreground mb-6">您需要登录后才能访问用户中心</p>
            <Button asChild>
              <Link href="/login">立即登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: '概览', icon: TrendingUp },
    { id: 'courses', label: '我的课程', icon: BookOpen },
    { id: 'earnings', label: '收益管理', icon: DollarSign },
    { id: 'referrals', label: '推广管理', icon: Users },
    { id: 'profile', label: '个人资料', icon: User }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">用户中心</h1>
          <p className="text-muted-foreground">
            欢迎回来，{user.username}！管理您的课程和收益。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
                          activeTab === tab.id ? 'bg-muted border-r-2 border-primary' : ''
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">总收益</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatPrice(dashboardData.stats.totalEarnings)}</div>
                      <p className="text-xs text-muted-foreground">
                        本月 +{formatPrice(dashboardData.stats.monthlyEarnings)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">推荐人数</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.stats.totalReferrals}</div>
                      <p className="text-xs text-muted-foreground">
                        转化率 {dashboardData.stats.conversionRate}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">已购课程</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.stats.activeCourses}</div>
                      <p className="text-xs text-muted-foreground">
                        总观看 {dashboardData.stats.totalViews} 次
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* 最近购买 */}
                <Card>
                  <CardHeader>
                    <CardTitle>最近购买</CardTitle>
                    <CardDescription>您最近购买的课程</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentPurchases.map((purchase) => (
                        <div key={purchase.id} className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{purchase.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              购买时间：{purchase.purchaseDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatPrice(purchase.price)}</div>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/video/${purchase.id}`}>开始学习</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 最近佣金 */}
                <Card>
                  <CardHeader>
                    <CardTitle>最近佣金</CardTitle>
                    <CardDescription>您最近获得的推广佣金</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentCommissions.map((commission) => (
                        <div key={commission.id} className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{commission.courseName}</h4>
                            <p className="text-sm text-muted-foreground">
                              推荐人：{commission.referralName} • {commission.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              +{formatPrice(commission.commission)}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              commission.status === 'paid' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {commission.status === 'paid' ? '已结算' : '待结算'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'courses' && (
              <Card>
                <CardHeader>
                  <CardTitle>我的课程</CardTitle>
                  <CardDescription>您已购买的所有课程</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentPurchases.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              购买时间：{course.purchaseDate}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                已观看 85%
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                剩余 15 分钟
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" asChild>
                            <Link href={`/video/${course.id}`}>继续学习</Link>
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>收益概览</CardTitle>
                    <CardDescription>您的推广收益统计</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          {formatPrice(dashboardData.stats.totalEarnings)}
                        </div>
                        <p className="text-sm text-muted-foreground">累计收益</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {formatPrice(dashboardData.stats.monthlyEarnings)}
                        </div>
                        <p className="text-sm text-muted-foreground">本月收益</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button>申请提现</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>佣金记录</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentCommissions.map((commission) => (
                        <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{commission.courseName}</h4>
                            <p className="text-sm text-muted-foreground">
                              推荐人：{commission.referralName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              时间：{commission.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">
                              +{formatPrice(commission.commission)}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              commission.status === 'paid' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {commission.status === 'paid' ? '已结算' : '待结算'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'referrals' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>推广统计</CardTitle>
                    <CardDescription>您的推广链接效果统计</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-2xl font-bold mb-2">{dashboardData.referralStats.totalClicks}</div>
                        <p className="text-sm text-muted-foreground">总点击数</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold mb-2">{dashboardData.referralStats.conversions}</div>
                        <p className="text-sm text-muted-foreground">成功转化</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold mb-2">{dashboardData.referralStats.conversionRate}%</div>
                        <p className="text-sm text-muted-foreground">转化率</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>推广工具</CardTitle>
                    <CardDescription>生成您的专属推广链接</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">您的推广码</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            value={user.id}
                            readOnly
                            className="flex-1 px-3 py-2 border rounded-md bg-muted"
                          />
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">推广链接</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            value={`https://yoursite.com?ref=${user.id}`}
                            readOnly
                            className="flex-1 px-3 py-2 border rounded-md bg-muted"
                          />
                          <Button size="sm" variant="outline">复制</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>个人资料</CardTitle>
                  <CardDescription>管理您的账户信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">用户名</label>
                        <input
                          type="text"
                          value={user.username}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">邮箱</label>
                        <input
                          type="email"
                          value={user.email}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button>保存更改</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
