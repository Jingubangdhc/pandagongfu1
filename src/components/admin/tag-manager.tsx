'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Search, Tag as TagIcon, Video } from 'lucide-react'
import { toast } from 'sonner'

interface Tag {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    videoTags: number
  }
}

interface TagFormData {
  name: string
  description: string
  color: string
  icon: string
}

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    description: '',
    color: '',
    icon: ''
  })

  // 获取标签列表
  const fetchTags = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/tags?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setTags(result.data)
      } else {
        toast.error(result.error || '获取标签列表失败')
      }
    } catch (error) {
      console.error('获取标签列表失败:', error)
      toast.error('获取标签列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 创建标签
  const createTag = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('标签名称不能为空')
        return
      }

      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('标签创建成功')
        setShowCreateDialog(false)
        resetForm()
        fetchTags()
      } else {
        toast.error(result.error || '创建标签失败')
      }
    } catch (error) {
      console.error('创建标签失败:', error)
      toast.error('创建标签失败')
    }
  }

  // 更新标签
  const updateTag = async () => {
    if (!editingTag) return

    try {
      if (!formData.name.trim()) {
        toast.error('标签名称不能为空')
        return
      }

      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('标签更新成功')
        setShowEditDialog(false)
        setEditingTag(null)
        resetForm()
        fetchTags()
      } else {
        toast.error(result.error || '更新标签失败')
      }
    } catch (error) {
      console.error('更新标签失败:', error)
      toast.error('更新标签失败')
    }
  }

  // 切换标签状态
  const toggleTagStatus = async (tag: Tag) => {
    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...tag, 
          isActive: !tag.isActive 
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(`标签已${!tag.isActive ? '启用' : '停用'}`)
        fetchTags()
      } else {
        toast.error(result.error || '更新标签状态失败')
      }
    } catch (error) {
      console.error('更新标签状态失败:', error)
      toast.error('更新标签状态失败')
    }
  }

  // 删除标签
  const deleteTag = async (tag: Tag) => {
    if (!confirm(`确定要删除标签"${tag.name}"吗？`)) return

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('标签删除成功')
        fetchTags()
      } else {
        toast.error(result.error || '删除标签失败')
      }
    } catch (error) {
      console.error('删除标签失败:', error)
      toast.error('删除标签失败')
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '',
      icon: ''
    })
  }

  // 打开编辑对话框
  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '',
      icon: tag.icon || ''
    })
    setShowEditDialog(true)
  }

  // 搜索处理
  const handleSearch = () => {
    fetchTags()
  }

  useEffect(() => {
    fetchTags()
  }, [])

  // 过滤标签
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          标签管理
        </CardTitle>
        <CardDescription>
          管理视频标签，支持标签的创建、编辑和删除
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 搜索和操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8 w-64"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              搜索
            </Button>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                创建标签
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新标签</DialogTitle>
                <DialogDescription>
                  创建一个新的视频标签
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">标签名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入标签名称"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="输入标签描述"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="color">颜色</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="icon">图标</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="🏷️"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button onClick={createTag}>创建</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 标签列表 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-8">
            <TagIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {searchTerm ? '没有找到匹配的标签' : '还没有创建任何标签'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建第一个标签
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标签</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>视频数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tag.icon && <span>{tag.icon}</span>}
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: tag.color || undefined }}
                      >
                        {tag.name}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={tag.description}>
                      {tag.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      {tag._count.videoTags}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={tag.isActive}
                      onCheckedChange={() => toggleTagStatus(tag)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTag(tag)}
                        disabled={tag._count.videoTags > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 编辑对话框 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑标签</DialogTitle>
              <DialogDescription>
                修改标签信息
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">标签名称 *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入标签名称"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">描述</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入标签描述"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-color">颜色</Label>
                  <Input
                    id="edit-color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-icon">图标</Label>
                  <Input
                    id="edit-icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🏷️"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                取消
              </Button>
              <Button onClick={updateTag}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
