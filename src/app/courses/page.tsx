"use client"

import { useState, useEffect } from 'react'
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { VideoCard } from '@/components/video/video-card'

// 模拟数据
const mockVideos = [
  {
    id: '1',
    title: '零基础学习太极拳入门课程',
    description: '从基础动作开始，循序渐进地学习太极拳的精髓，适合所有年龄段的学习者。',
    thumbnail: '/api/placeholder/400/225',
    price: 99,
    originalPrice: 199,
    duration: 3600,
    rating: 4.8,
    students: 1234,
    instructor: '李师傅',
    category: '太极拳'
  },
  {
    id: '2',
    title: '高级太极拳技法精讲',
    description: '深入讲解太极拳的高级技法和内功修炼，提升你的太极拳水平。',
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
    description: '学习传统养生气功，改善身体健康，提升生活质量。',
    thumbnail: '/api/placeholder/400/225',
    price: 79,
    originalPrice: 159,
    duration: 2700,
    rating: 4.7,
    students: 2156,
    instructor: '张师傅',
    category: '气功'
  },
  {
    id: '4',
    title: '八段锦完整教学',
    description: '传统八段锦功法完整教学，强身健体，延年益寿。',
    thumbnail: '/api/placeholder/400/225',
    price: 89,
    originalPrice: 149,
    duration: 1800,
    rating: 4.6,
    students: 987,
    instructor: '刘师傅',
    category: '八段锦'
  },
  {
    id: '5',
    title: '五禽戏养生功法',
    description: '模仿虎、鹿、熊、猿、鸟五种动物的动作，达到强身健体的效果。',
    thumbnail: '/api/placeholder/400/225',
    price: 69,
    originalPrice: 129,
    duration: 2100,
    rating: 4.5,
    students: 654,
    instructor: '陈师傅',
    category: '五禽戏'
  },
  {
    id: '6',
    title: '易筋经内功修炼',
    description: '古传易筋经内功修炼方法，增强体质，提升内力。',
    thumbnail: '/api/placeholder/400/225',
    price: 159,
    originalPrice: 259,
    duration: 4200,
    rating: 4.8,
    students: 432,
    instructor: '赵师傅',
    category: '易筋经'
  }
]

const categories = ['全部', '太极拳', '气功', '八段锦', '五禽戏', '易筋经', '六字诀']
const sortOptions = [
  { value: 'newest', label: '最新发布' },
  { value: 'popular', label: '最受欢迎' },
  { value: 'price-low', label: '价格从低到高' },
  { value: 'price-high', label: '价格从高到低' },
  { value: 'rating', label: '评分最高' }
]

export default function CoursesPage() {
  const [videos, setVideos] = useState(mockVideos)
  const [filteredVideos, setFilteredVideos] = useState(mockVideos)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // 搜索和筛选逻辑
  useEffect(() => {
    let filtered = videos

    // 按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(video => video.category === selectedCategory)
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 排序
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.students - a.students)
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        // 保持原始顺序（最新发布）
        break
    }

    setFilteredVideos(filtered)
  }, [videos, searchQuery, selectedCategory, sortBy])

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">所有课程</h1>
          <p className="text-muted-foreground">
            发现适合您的高质量视频课程，开始您的学习之旅
          </p>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="mb-8 space-y-4">
          {/* 搜索框 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="搜索课程、讲师或关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                筛选
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* 筛选选项 */}
          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex flex-wrap gap-4">
              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* 排序选项 */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">排序：</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border rounded px-3 py-1"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            找到 {filteredVideos.length} 门课程
          </p>
        </div>

        {/* 课程列表 */}
        {filteredVideos.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">未找到相关课程</h3>
                <p>请尝试调整搜索条件或筛选选项</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('全部')
                  setSortBy('newest')
                }}
              >
                清除筛选条件
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 加载更多按钮 */}
        {filteredVideos.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              加载更多课程
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
