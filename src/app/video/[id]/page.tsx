"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Clock, Users, Share2, Heart, ShoppingCart, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { VideoCard } from '@/components/video/video-card'
import { formatPrice, formatDuration, generateShareLink } from '@/lib/utils'
import { useUser, useCart } from '@/components/providers'
import { useToast } from '@/hooks/use-toast'

// 模拟视频数据
const mockVideo = {
  id: '1',
  title: '零基础学习太极拳入门课程',
  description: '从基础动作开始，循序渐进地学习太极拳的精髓，适合所有年龄段的学习者。本课程将带您深入了解太极拳的历史文化背景，掌握基本功法，学会完整的太极拳套路。',
  thumbnail: '/api/placeholder/800/450',
  videoUrl: '/api/placeholder/video.mp4',
  price: 99,
  originalPrice: 199,
  duration: 3600,
  rating: 4.8,
  students: 1234,
  instructor: '李师傅',
  category: '太极拳',
  tags: ['太极拳', '入门', '基础', '养生'],
  difficulty: '初级',
  createdAt: '2024-01-15',
  chapters: [
    { id: 1, title: '太极拳简介与历史', duration: 600, isFree: true },
    { id: 2, title: '基本站桩与呼吸法', duration: 900, isFree: false },
    { id: 3, title: '太极拳基本手法', duration: 1200, isFree: false },
    { id: 4, title: '太极拳基本步法', duration: 1080, isFree: false },
    { id: 5, title: '完整套路演示', duration: 1200, isFree: false }
  ],
  instructorInfo: {
    name: '李师傅',
    avatar: '/api/placeholder/100/100',
    bio: '太极拳传承人，从事太极拳教学20余年，学员遍布全球。',
    experience: '20年教学经验',
    students: 5000
  }
}

const relatedVideos = [
  {
    id: '2',
    title: '高级太极拳技法精讲',
    description: '深入讲解太极拳的高级技法和内功修炼。',
    thumbnail: '/api/placeholder/400/225',
    price: 199,
    originalPrice: 299,
    duration: 5400,
    rating: 4.9,
    students: 856,
    instructor: '王师傅',
    category: '太极拳'
  },
  {
    id: '3',
    title: '养生气功基础教程',
    description: '学习传统养生气功，改善身体健康。',
    thumbnail: '/api/placeholder/400/225',
    price: 79,
    originalPrice: 159,
    duration: 2700,
    rating: 4.7,
    students: 2156,
    instructor: '张师傅',
    category: '气功'
  }
]

export default function VideoDetailPage() {
  const params = useParams()
  const { user } = useUser()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [video, setVideo] = useState(mockVideo)
  const [isPurchased, setIsPurchased] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentChapter, setCurrentChapter] = useState(0)

  const videoId = params.id as string

  useEffect(() => {
    // 这里应该根据ID获取视频数据
    // 暂时使用模拟数据
    setVideo(mockVideo)
    
    // 检查用户是否已购买
    if (user) {
      // 这里应该检查用户的购买记录
      setIsPurchased(false)
    }
  }, [videoId, user])

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "您需要登录后才能购买课程",
        variant: "destructive",
      })
      window.location.href = '/login'
      return
    }

    // 跳转到支付页面
    window.location.href = `/checkout?video=${video.id}`
  }

  const handleAddToCart = () => {
    addItem({
      videoId: video.id,
      title: video.title,
      price: video.price,
      thumbnail: video.thumbnail
    })

    toast({
      title: "已添加到购物车",
      description: `${video.title} 已添加到购物车`,
    })
  }

  const handleShare = () => {
    const shareUrl = user 
      ? generateShareLink(user.id, video.id)
      : window.location.href

    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "链接已复制",
      description: user ? "分享链接已复制，通过此链接购买您将获得佣金" : "课程链接已复制到剪贴板",
    })
  }

  const discountPercentage = video.originalPrice 
    ? Math.round((1 - video.price / video.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 视频播放器 */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  {isPlaying || isPurchased ? (
                    <video
                      controls
                      className="w-full h-full"
                      poster={video.thumbnail}
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                      您的浏览器不支持视频播放。
                    </video>
                  ) : (
                    <>
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Button
                          size="lg"
                          className="rounded-full w-16 h-16"
                          onClick={() => setIsPlaying(true)}
                        >
                          <Play className="h-8 w-8" />
                        </Button>
                      </div>
                      {!isPurchased && (
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded">
                          预览模式
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 视频信息 */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="bg-muted px-2 py-1 rounded">{video.category}</span>
                  <span>•</span>
                  <span>{video.difficulty}</span>
                  <span>•</span>
                  <span>{formatDuration(video.duration)}</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
                <p className="text-muted-foreground">{video.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{video.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{video.students} 学员</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{formatDuration(video.duration)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted px-2 py-1 rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 课程章节 */}
            <Card>
              <CardHeader>
                <CardTitle>课程内容</CardTitle>
                <CardDescription>
                  共 {video.chapters.length} 个章节，总时长 {formatDuration(video.duration)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {video.chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-muted/50 ${
                        currentChapter === index ? 'bg-muted' : ''
                      }`}
                      onClick={() => setCurrentChapter(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{chapter.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDuration(chapter.duration)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {chapter.isFree && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            免费
                          </span>
                        )}
                        <Play className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 讲师信息 */}
            <Card>
              <CardHeader>
                <CardTitle>讲师介绍</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Image
                    src={video.instructorInfo.avatar}
                    alt={video.instructorInfo.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{video.instructorInfo.name}</h3>
                    <p className="text-muted-foreground mb-2">{video.instructorInfo.bio}</p>
                    <div className="flex gap-4 text-sm">
                      <span>{video.instructorInfo.experience}</span>
                      <span>•</span>
                      <span>{video.instructorInfo.students} 学员</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 购买卡片 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatPrice(video.price)}
                  </div>
                  {video.originalPrice && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(video.originalPrice)}
                      </span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
                        省 {formatPrice(video.originalPrice - video.price)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {isPurchased ? (
                    <Button className="w-full" size="lg">
                      <Play className="h-5 w-5 mr-2" />
                      开始学习
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full" size="lg" onClick={handlePurchase}>
                        立即购买
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        加入购物车
                      </Button>
                    </>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      分享
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="h-4 w-4 mr-2" />
                      收藏
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>课程时长</span>
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>学习人数</span>
                    <span>{video.students} 人</span>
                  </div>
                  <div className="flex justify-between">
                    <span>课程评分</span>
                    <span>{video.rating} ⭐</span>
                  </div>
                  <div className="flex justify-between">
                    <span>更新时间</span>
                    <span>{video.createdAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 相关课程 */}
            <Card>
              <CardHeader>
                <CardTitle>相关课程</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <div key={relatedVideo.id} className="flex gap-3">
                    <Link href={`/video/${relatedVideo.id}`} className="shrink-0">
                      <Image
                        src={relatedVideo.thumbnail}
                        alt={relatedVideo.title}
                        width={120}
                        height={68}
                        className="rounded object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/video/${relatedVideo.id}`}>
                        <h4 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                          {relatedVideo.title}
                        </h4>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {relatedVideo.instructor}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-primary">
                          {formatPrice(relatedVideo.price)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{relatedVideo.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 推荐课程 */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">推荐课程</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
