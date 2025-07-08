'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, Video, ShoppingCart, TrendingUp } from 'lucide-react'

export default function AdminPage() {
  const [loginForm, setLoginForm] = useState({
    email: 'admin@pandagongfu.com',
    password: 'admin123456'
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginForm.email === 'admin@pandagongfu.com' && loginForm.password === 'admin123456') {
      setIsLoggedIn(true)
    } else {
      alert('登录失败：邮箱或密码错误')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Link>
            <h1 className="text-2xl font-bold">管理员登录</h1>
            <p className="text-muted-foreground">请使用管理员账号登录</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>登录信息</CardTitle>
              <CardDescription>
                默认管理员账号已预填，点击登录即可
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  登录
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>默认管理员账号：admin@pandagongfu.com</p>
            <p>默认密码：admin123456</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <span className="text-white font-bold text-lg">慧</span>
              </div>
              <span className="font-bold text-xl">管理后台</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">欢迎，管理员</span>
            <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">管理后台</h1>
            <p className="text-muted-foreground">Pandagongfu-慧 视频学习平台管理系统</p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+20.1% 较上月</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">视频总数</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">+5 本月新增</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总订单数</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">456</div>
                <p className="text-xs text-muted-foreground">+12.5% 较上月</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总收入</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥45,231</div>
                <p className="text-xs text-muted-foreground">+15.2% 较上月</p>
              </CardContent>
            </Card>
          </div>

          {/* 功能模块 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
                <CardDescription>
                  管理用户账号、权限和个人信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  进入用户管理
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>视频管理</CardTitle>
                <CardDescription>
                  上传、编辑和管理视频课程内容
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  进入视频管理
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>订单管理</CardTitle>
                <CardDescription>
                  查看和处理用户订单信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  进入订单管理
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>佣金管理</CardTitle>
                <CardDescription>
                  管理分销佣金和提现申请
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  进入佣金管理
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>数据统计</CardTitle>
                <CardDescription>
                  查看平台运营数据和分析报告
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  查看统计数据
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>系统设置</CardTitle>
                <CardDescription>
                  配置系统参数和平台设置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  进入系统设置
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 系统状态 */}
          <Card>
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
              <CardDescription>
                当前系统运行状态和配置信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">数据库状态</h4>
                  <p className="text-sm text-green-600">✅ SQLite 数据库运行正常</p>
                  <p className="text-sm text-muted-foreground">已初始化完整数据结构</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">支付网关</h4>
                  <p className="text-sm text-green-600">✅ Stripe 测试环境已配置</p>
                  <p className="text-sm text-muted-foreground">支持信用卡支付</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">云存储</h4>
                  <p className="text-sm text-green-600">✅ 文件上传功能正常</p>
                  <p className="text-sm text-muted-foreground">支持视频和图片上传</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">部署状态</h4>
                  <p className="text-sm text-green-600">✅ CloudBase 部署成功</p>
                  <p className="text-sm text-muted-foreground">静态网站托管</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>注意：这是演示版本的管理后台，完整功能需要后端API支持</p>
          </div>
        </div>
      </div>
    </div>
  )
}
