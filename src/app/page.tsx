import Link from 'next/link'
import { Play, Star, Users, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 简化的Header */}
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
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              学习中心
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                登录
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                注册
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* 英雄区域 */}
      <section className="relative text-white overflow-hidden">
        {/* 山水画背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-30">
            <svg viewBox="0 0 1200 800" className="w-full h-full object-cover">
              {/* 远山 */}
              <path d="M0,400 Q200,300 400,350 T800,320 Q1000,300 1200,340 L1200,800 L0,800 Z" fill="#1e293b" opacity="0.8"/>
              {/* 中山 */}
              <path d="M0,500 Q150,400 300,450 T600,420 Q800,400 1200,440 L1200,800 L0,800 Z" fill="#334155" opacity="0.6"/>
              {/* 近山 */}
              <path d="M0,600 Q100,520 200,550 T500,530 Q700,520 1200,560 L1200,800 L0,800 Z" fill="#475569" opacity="0.4"/>
              {/* 云雾效果 */}
              <circle cx="300" cy="200" r="80" fill="white" opacity="0.1"/>
              <circle cx="500" cy="150" r="60" fill="white" opacity="0.08"/>
              <circle cx="800" cy="180" r="70" fill="white" opacity="0.1"/>
            </svg>
          </div>
          {/* 渐变叠加 */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
        </div>
        <div className="container py-24 md:py-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="text-yellow-300">Pandagongfu-慧</span>
                <br />传统武学智慧传承
              </h1>
              <p className="text-xl text-blue-100">
                传承千年武学精髓，融合现代教学理念，让传统功夫智慧在新时代绽放光彩
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  开启武学之旅
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  传承分享计划
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>10,000+ 武学传人</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>500+ 功法秘籍</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>4.8 传承评分</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden shadow-2xl bg-slate-700 flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-white mx-auto mb-4" />
                  <p className="text-white">学习视频预览</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特色功法展示 */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">精选功法课程</h2>
            <p className="text-lg text-muted-foreground">
              传承千年的武学精髓，现代化的学习体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 太极拳课程 */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">太极拳基础</p>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">太极拳入门</h3>
                <p className="text-muted-foreground mb-4">
                  从基础站桩开始，学习太极拳的核心理念和基本动作
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">¥199</span>
                  <Button>立即学习</Button>
                </div>
              </CardContent>
            </Card>

            {/* 八段锦课程 */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">八段锦养生</p>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">八段锦养生功</h3>
                <p className="text-muted-foreground mb-4">
                  古代养生功法，强身健体，调理气血，适合现代人练习
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">¥149</span>
                  <Button>立即学习</Button>
                </div>
              </CardContent>
            </Card>

            {/* 内功心法课程 */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">内功心法</p>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">内功心法秘传</h3>
                <p className="text-muted-foreground mb-4">
                  深入学习内功修炼方法，提升内在能量和身心健康
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">¥299</span>
                  <Button>立即学习</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/courses">
              <Button size="lg" variant="outline">
                查看更多课程
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 特色功能介绍 */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">为什么选择Pandagongfu-慧</h2>
            <p className="text-lg text-muted-foreground">
              专业的武学传承平台，为您提供最优质的学习体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">高清视频教学</h3>
              <p className="text-muted-foreground">
                专业摄制的高清视频，多角度展示每个动作细节
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">名师亲授</h3>
              <p className="text-muted-foreground">
                汇聚各门派名师，传承正宗武学精髓
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">随时随地学习</h3>
              <p className="text-muted-foreground">
                支持多设备学习，随时随地练习武学功法
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">分享获益</h3>
              <p className="text-muted-foreground">
                推广课程获得佣金，传承武学的同时获得收益
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Pandagongfu-慧. 传承武学智慧，弘扬传统文化。</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
