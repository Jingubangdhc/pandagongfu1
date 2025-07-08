'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Star, Clock, Users, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// 模拟课程数据
const mockCourses = [
  {
    id: 1,
    title: '太极拳入门基础',
    description: '从基础站桩开始，学习太极拳的核心理念和基本动作，适合零基础学员',
    price: 199,
    originalPrice: 299,
    instructor: '张三丰',
    duration: '2小时30分',
    students: 1234,
    rating: 4.8,
    level: '初级',
    category: '太极拳',
    tags: ['基础', '养生', '内功'],
    thumbnail: '/api/placeholder/400/225'
  },
  {
    id: 2,
    title: '八段锦养生功法',
    description: '古代养生功法，强身健体，调理气血，适合现代人练习',
    price: 149,
    originalPrice: 199,
    instructor: '李时珍',
    duration: '1小时45分',
    students: 856,
    rating: 4.9,
    level: '初级',
    category: '养生功',
    tags: ['养生', '健身', '气功'],
    thumbnail: '/api/placeholder/400/225'
  },
  {
    id: 3,
    title: '内功心法秘传',
    description: '深入学习内功修炼方法，提升内在能量和身心健康',
    price: 299,
    originalPrice: 399,
    instructor: '王重阳',
    duration: '3小时15分',
    students: 567,
    rating: 4.7,
    level: '中级',
    category: '内功',
    tags: ['内功', '心法', '进阶'],
    thumbnail: '/api/placeholder/400/225'
  },
  {
    id: 4,
    title: '五禽戏完整教学',
    description: '华佗五禽戏完整套路，模仿虎、鹿、熊、猿、鸟五种动物的动作',
    price: 179,
    originalPrice: 249,
    instructor: '华佗',
    duration: '2小时',
    students: 723,
    rating: 4.6,
    level: '初级',
    category: '养生功',
    tags: ['五禽戏', '养生', '传统'],
    thumbnail: '/api/placeholder/400/225'
  },
  {
    id: 5,
    title: '武当剑法基础',
    description: '武当派经典剑法，注重内外兼修，剑法飘逸灵动',
    price: 259,
    originalPrice: 329,
    instructor: '张无忌',
    duration: '2小时45分',
    students: 445,
    rating: 4.8,
    level: '中级',
    category: '剑法',
    tags: ['剑法', '武当', '技击'],
    thumbnail: '/api/placeholder/400/225'
  },
  {
    id: 6,
    title: '少林易筋经',
    description: '少林寺传统内功心法，强筋健骨，增强体质',
    price: 329,
    originalPrice: 429,
    instructor: '达摩祖师',
    duration: '4小时',
    students: 334,
    rating: 4.9,
    level: '高级',
    category: '内功',
    tags: ['易筋经', '少林', '内功'],
    thumbnail: '/api/placeholder/400/225'
  }
]

export default function CoursesPage() {
  const [courses, setCourses] = useState(mockCourses)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [selectedLevel, setSelectedLevel] = useState('全部')

  const categories = ['全部', '太极拳', '养生功', '内功', '剑法']
  const levels = ['全部', '初级', '中级', '高级']

  // 过滤课程
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '全部' || course.category === selectedCategory
    const matchesLevel = selectedLevel === '全部' || course.level === selectedLevel
    
    return matchesSearch && matchesCategory && matchesLevel
  })

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
            <Link href="/courses" className="text-sm font-medium text-primary">
              课程
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              学习中心
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">登录</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">注册</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 页面内容 */}
      <div className="container py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">功法课程</h1>
          <p className="text-lg text-muted-foreground">
            精选传统武学课程，传承千年智慧
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="搜索课程、导师或关键词..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 课程网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">{course.category}</p>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{course.level}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    {course.rating}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="mr-4">{course.students}人学习</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {course.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">¥{course.price}</span>
                    {course.originalPrice > course.price && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        ¥{course.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button>立即学习</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">没有找到符合条件的课程</p>
          </div>
        )}
      </div>
    </div>
  )
}
