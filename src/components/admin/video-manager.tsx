"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Video,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Tag,
  X,
  Eye
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Video {
  id: string
  title: string
  description: string
  thumbnail?: string
  videoUrl: string
  price: number
  originalPrice?: number
  duration: number
  instructor: string
  difficulty: string
  isActive: boolean
  createdAt: string
  category: {
    id: string
    name: string
  }
  videoTags: Array<{
    tag: {
      id: string
      name: string
      color?: string
      icon?: string
    }
  }>
}

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
  color?: string
  icon?: string
}

interface VideoFormData {
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  price: number
  originalPrice?: number
  duration: number
  instructor: string
  categoryId: string
  difficulty: string
  tagIds: string[]
}

export function VideoManager() {
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [priceRangeFilter, setPriceRangeFilter] = useState<{ min: number; max: number }>({ min: 0, max: 1000 })
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    thumbnail: '',
    videoUrl: '',
    price: 0,
    originalPrice: 0,
    duration: 0,
    instructor: '',
    categoryId: '',
    difficulty: '初级',
    tagIds: []
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [videosRes, categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/videos'),
        fetch('/api/categories'),
        fetch('/api/tags')
      ])

      if (videosRes.ok) {
        const videosData = await videosRes.json()
        setVideos(videosData.data || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.data || [])
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json()
        setTags(tagsData.data || [])
      }
    } catch (error) {
      console.error('获取数据失败:', error)
      toast({
        title: "错误",
        description: "获取数据失败",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchVideos()
  }

  const fetchVideos = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','))
      if (difficultyFilter) params.append('difficulty', difficultyFilter)
      if (priceRangeFilter.min > 0) params.append('minPrice', priceRangeFilter.min.toString())
      if (priceRangeFilter.max < 1000) params.append('maxPrice', priceRangeFilter.max.toString())

      const response = await fetch(`/api/videos?${params}`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.data || [])
      }
    } catch (error) {
      console.error('获取视频失败:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      videoUrl: '',
      price: 0,
      originalPrice: 0,
      duration: 0,
      instructor: '',
      categoryId: '',
      difficulty: '初级',
      tagIds: []
    })
  }

  const handleCreate = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail || '',
      videoUrl: video.videoUrl,
      price: video.price,
      originalPrice: video.originalPrice || 0,
      duration: video.duration,
      instructor: video.instructor,
      categoryId: video.category.id,
      difficulty: video.difficulty,
      tagIds: video.videoTags.map(vt => vt.tag.id)
    })
    setIsEditDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingVideo ? `/api/videos/${editingVideo.id}` : '/api/videos'
      const method = editingVideo ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('操作失败')
      }

      toast({
        title: "成功",
        description: editingVideo ? "视频更新成功" : "视频创建成功",
      })

      setIsCreateDialogOpen(false)
      setIsEditDialogOpen(false)
      setEditingVideo(null)
      fetchData()
    } catch (error) {
      console.error('提交失败:', error)
      toast({
        title: "错误",
        description: "操作失败，请重试",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (videoId: string) => {
    if (!confirm('确定要删除这个视频吗？')) return

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      toast({
        title: "成功",
        description: "视频删除成功",
      })

      fetchData()
    } catch (error) {
      console.error('删除失败:', error)
      toast({
        title: "错误",
        description: "删除失败，请重试",
        variant: "destructive",
      })
    }
  }

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }))
  }

  const removeSelectedTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId))
  }

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  const handleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([])
    } else {
      setSelectedVideos(videos.map(v => v.id))
    }
  }

  const handleBatchDelete = async () => {
    if (selectedVideos.length === 0) return

    if (!confirm(`确定要删除选中的 ${selectedVideos.length} 个视频吗？`)) return

    try {
      await Promise.all(
        selectedVideos.map(videoId =>
          fetch(`/api/videos/${videoId}`, {
            method: 'DELETE',
            credentials: 'include'
          })
        )
      )

      toast({
        title: "成功",
        description: `已删除 ${selectedVideos.length} 个视频`,
      })

      setSelectedVideos([])
      fetchData()
    } catch (error) {
      console.error('批量删除失败:', error)
      toast({
        title: "错误",
        description: "批量删除失败，请重试",
        variant: "destructive",
      })
    }
  }

  const handleBatchUpdateStatus = async (isActive: boolean) => {
    if (selectedVideos.length === 0) return

    try {
      await Promise.all(
        selectedVideos.map(videoId =>
          fetch(`/api/videos/${videoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ isActive })
          })
        )
      )

      toast({
        title: "成功",
        description: `已${isActive ? '启用' : '禁用'} ${selectedVideos.length} 个视频`,
      })

      setSelectedVideos([])
      fetchData()
    } catch (error) {
      console.error('批量更新状态失败:', error)
      toast({
        title: "错误",
        description: "批量更新状态失败，请重试",
        variant: "destructive",
      })
    }
  }

  const handlePreview = (video: Video) => {
    setPreviewVideo(video)
    setIsPreviewDialogOpen(true)
  }

  const applyAdvancedFilters = () => {
    fetchVideos()
  }

  if (loading) {
    return <div className="flex justify-center p-8">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            视频管理
          </CardTitle>
          <CardDescription>
            管理视频内容、分类和标签
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索视频标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">所有分类</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button onClick={handleCreate} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              新建视频
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              高级筛选
            </Button>
          </div>

          {/* 高级筛选面板 */}
          {showAdvancedFilters && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>难度筛选</Label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择难度" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">所有难度</SelectItem>
                      <SelectItem value="初级">初级</SelectItem>
                      <SelectItem value="中级">中级</SelectItem>
                      <SelectItem value="高级">高级</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>价格范围</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="最低价"
                      value={priceRangeFilter.min}
                      onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                    />
                    <Input
                      type="number"
                      placeholder="最高价"
                      value={priceRangeFilter.max}
                      onChange={(e) => setPriceRangeFilter(prev => ({ ...prev, max: parseFloat(e.target.value) || 1000 }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>标签筛选</Label>
                  <Select value="" onValueChange={(tagId) => {
                    if (tagId && !selectedTags.includes(tagId)) {
                      setSelectedTags(prev => [...prev, tagId])
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="添加标签筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.filter(tag => !selectedTags.includes(tag.id)).map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.icon} {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={applyAdvancedFilters}>
                  应用筛选
                </Button>
                <Button variant="outline" onClick={() => {
                  setDifficultyFilter('')
                  setPriceRangeFilter({ min: 0, max: 1000 })
                  setSelectedTags([])
                  fetchVideos()
                }}>
                  重置筛选
                </Button>
              </div>
            </div>
          )}

          {/* 已选择的标签 */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">筛选标签:</span>
              {selectedTags.map((tagId) => {
                const tag = tags.find(t => t.id === tagId)
                return tag ? (
                  <Badge key={tagId} variant="secondary" className="flex items-center gap-1">
                    {tag.icon} {tag.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSelectedTag(tagId)}
                    />
                  </Badge>
                ) : null
              })}
            </div>
          )}

          {/* 批量操作 */}
          {selectedVideos.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <span className="text-sm">已选择 {selectedVideos.length} 个视频</span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={() => handleBatchUpdateStatus(true)}>
                  批量启用
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBatchUpdateStatus(false)}>
                  批量禁用
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBatchDelete}>
                  批量删除
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedVideos([])}>
                  取消选择
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 视频列表 */}
      <Card>
        <CardHeader>
          <CardTitle>视频列表</CardTitle>
          <CardDescription>
            共 {videos.length} 个视频
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedVideos.length === videos.length && videos.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>时长</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => handleVideoSelect(video.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {video.thumbnail && (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-12 h-8 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => handlePreview(video)}
                        />
                      )}
                      <div>
                        <div className="font-medium">{video.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {video.instructor}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {video.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {video.videoTags.slice(0, 3).map((vt) => (
                        <Badge
                          key={vt.tag.id}
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: vt.tag.color + '20', color: vt.tag.color }}
                        >
                          {vt.tag.icon} {vt.tag.name}
                        </Badge>
                      ))}
                      {video.videoTags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{video.videoTags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">¥{video.price}</span>
                      {video.originalPrice && video.originalPrice > video.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ¥{video.originalPrice}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={video.isActive ? "default" : "secondary"}>
                      {video.isActive ? "活跃" : "禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(video)}>
                          <Eye className="h-4 w-4 mr-2" />
                          预览
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(video)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(video.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 创建视频对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建新视频</DialogTitle>
            <DialogDescription>
              填写视频信息并选择相关标签
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">讲师</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl">视频链接 *</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">缩略图链接</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">价格 *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">原价</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">时长(分钟)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">分类 *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">难度</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="初级">初级</SelectItem>
                    <SelectItem value="中级">中级</SelectItem>
                    <SelectItem value="高级">高级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 标签选择 */}
            <div className="space-y-2">
              <Label>标签</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        formData.tagIds.includes(tag.id)
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      <span>{tag.icon}</span>
                      <span className="text-sm">{tag.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              {formData.tagIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tagIds.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId)
                    return tag ? (
                      <Badge key={tagId} variant="secondary">
                        {tag.icon} {tag.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                创建视频
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 编辑视频对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑视频</DialogTitle>
            <DialogDescription>
              修改视频信息和标签
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">标题 *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instructor">讲师</Label>
                <Input
                  id="edit-instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">描述 *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-videoUrl">视频链接 *</Label>
                <Input
                  id="edit-videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-thumbnail">缩略图链接</Label>
                <Input
                  id="edit-thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">价格 *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-originalPrice">原价</Label>
                <Input
                  id="edit-originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">时长(分钟)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-categoryId">分类 *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">难度</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="初级">初级</SelectItem>
                    <SelectItem value="中级">中级</SelectItem>
                    <SelectItem value="高级">高级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 标签选择 */}
            <div className="space-y-2">
              <Label>标签</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        formData.tagIds.includes(tag.id)
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      <span>{tag.icon}</span>
                      <span className="text-sm">{tag.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              {formData.tagIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tagIds.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId)
                    return tag ? (
                      <Badge key={tagId} variant="secondary">
                        {tag.icon} {tag.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                更新视频
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 视频预览对话框 */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>视频预览</DialogTitle>
            <DialogDescription>
              预览视频详细信息
            </DialogDescription>
          </DialogHeader>
          {previewVideo && (
            <div className="space-y-6">
              {/* 视频播放器 */}
              {previewVideo.videoUrl && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full"
                    poster={previewVideo.thumbnail}
                  >
                    <source src={previewVideo.videoUrl} type="video/mp4" />
                    您的浏览器不支持视频播放。
                  </video>
                </div>
              )}

              {/* 视频信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{previewVideo.title}</h3>
                    <p className="text-muted-foreground">{previewVideo.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">讲师:</span>
                      <p>{previewVideo.instructor}</p>
                    </div>
                    <div>
                      <span className="font-medium">难度:</span>
                      <p>{previewVideo.difficulty}</p>
                    </div>
                    <div>
                      <span className="font-medium">时长:</span>
                      <p>{Math.floor(previewVideo.duration / 60)}:{(previewVideo.duration % 60).toString().padStart(2, '0')}</p>
                    </div>
                    <div>
                      <span className="font-medium">价格:</span>
                      <p>
                        ¥{previewVideo.price}
                        {previewVideo.originalPrice && previewVideo.originalPrice > previewVideo.price && (
                          <span className="ml-2 line-through text-muted-foreground">
                            ¥{previewVideo.originalPrice}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="font-medium">分类:</span>
                    <p>{previewVideo.category?.name}</p>
                  </div>

                  <div>
                    <span className="font-medium">标签:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {previewVideo.videoTags?.map((videoTag: any) => (
                        <Badge key={videoTag.tag.id} variant="secondary">
                          {videoTag.tag.icon} {videoTag.tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">状态:</span>
                    <div className="mt-1">
                      <Badge variant={previewVideo.isActive ? "default" : "secondary"}>
                        {previewVideo.isActive ? "活跃" : "禁用"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium">学习人数:</span>
                    <p>{(previewVideo as any).purchases?.length || (previewVideo as any).students || 0} 人</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                  关闭
                </Button>
                <Button onClick={() => {
                  setIsPreviewDialogOpen(false)
                  handleEdit(previewVideo)
                }}>
                  编辑视频
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
