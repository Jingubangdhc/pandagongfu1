import Link from 'next/link'
import { Play, Star, Users, Clock, ArrowRight } from 'lucide-react'
import { HeroImage, VideoThumbnail } from '@/components/optimized/optimized-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { formatPrice } from '@/lib/utils'

// 模拟数据
const featuredVideos = [
  {
    id: '1',
    title: '太极拳入门心法 - 阴阳调和之道',
    description: '从太极哲学入手，领悟阴阳调和的奥秘，掌握太极拳的核心精神与基础功法。',
    thumbnail: '/api/placeholder/400/225',
    price: 99,
    originalPrice: 199,
    duration: 3600, // 60分钟
    rating: 4.8,
    students: 1234,
    instructor: '李玄德师父',
    category: '太极拳'
  },
  {
    id: '2',
    title: '武当内家功法 - 丹田修炼秘传',
    description: '传承武当山千年内功心法，修炼丹田真气，强身健体，延年益寿。',
    thumbnail: '/api/placeholder/400/225',
    price: 199,
    originalPrice: 299,
    duration: 5400, // 90分钟
    rating: 4.9,
    students: 856,
    instructor: '王清虚道长',
    category: '内功'
  },
  {
    id: '3',
    title: '八段锦养生功 - 古法新传',
    description: '传统八段锦功法，结合现代养生理念，调理五脏六腑，平衡身心。',
    thumbnail: '/api/placeholder/400/225',
    price: 79,
    originalPrice: 159,
    duration: 2700, // 45分钟
    rating: 4.7,
    students: 2156,
    instructor: '张慧明师父',
    category: '养生功'
  }
]

const categories = [
  { name: '太极拳法', count: 25, icon: '☯️' },
  { name: '内功心法', count: 18, icon: '🧘' },
  { name: '八段锦', count: 12, icon: '🌸' },
  { name: '五禽戏', count: 8, icon: '🦅' },
  { name: '易筋经', count: 6, icon: '🏔️' },
  { name: '武当功法', count: 4, icon: '⛰️' }
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
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
              <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
                <HeroImage
                  src="/api/placeholder/600/400"
                  alt="学习视频预览"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                    <Play className="h-8 w-8 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特色课程 */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">精选功法</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              千年传承的武学精髓，由资深师父亲授，助您领悟传统功夫的深邃智慧
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video">
                  <VideoThumbnail
                    src={video.thumbnail}
                    alt={video.title}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="sm" className="rounded-full">
                      <Play className="h-4 w-4 mr-2" />
                      预览
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    限时优惠
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{video.category}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{Math.round(video.duration / 60)}分钟</span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{video.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({video.students} 学员)
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(video.price)}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        {formatPrice(video.originalPrice)}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/video/${video.id}`}>
                      立即购买
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link href="/courses">
                查看所有课程
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 课程分类 */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">课程分类</h2>
            <p className="text-lg text-muted-foreground">
              丰富的课程分类，满足不同学习需求
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/category/${category.name}`}
                className="group"
              >
                <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.count} 门课程
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 分销推广 */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                分享课程，赚取佣金
              </h2>
              <p className="text-lg text-muted-foreground">
                成为我们的分销伙伴，分享优质课程给朋友，每成功推荐一位用户购买课程，
                您都能获得丰厚的佣金回报。
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>一级推荐佣金：15%</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>二级推荐佣金：5%</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>实时结算，快速提现</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>专业推广工具支持</span>
                </li>
              </ul>
              <Button size="lg" asChild>
                <Link href="/affiliate">
                  立即加入分销
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <VideoThumbnail
                src="/api/placeholder/500/400"
                alt="分销推广"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
