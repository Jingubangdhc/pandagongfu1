'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, FolderTree, List, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description?: string
  slug: string
  icon?: string
  color?: string
  order: number
  parentId?: string
  parent?: Category
  children?: Category[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    videos: number
    children: number
  }
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [flatCategories, setFlatCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree')
  const [showInactive, setShowInactive] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    icon: '',
    color: '#3B82F6',
    order: 0,
    parentId: '',
    isActive: true
  })

  useEffect(() => {
    fetchCategories()
  }, [showInactive])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      // 获取树形结构
      const treeResponse = await fetch(`/api/categories?includeInactive=${showInactive}`)
      const treeData = await treeResponse.json()
      
      // 获取扁平结构
      const flatResponse = await fetch(`/api/categories?flat=true&includeInactive=${showInactive}`)
      const flatData = await flatResponse.json()
      
      if (treeData.success && flatData.success) {
        setCategories(treeData.data)
        setFlatCategories(flatData.data)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
      toast.error('获取分类失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setIsDialogOpen(false)
        resetForm()
        fetchCategories()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('保存分类失败:', error)
      toast.error('保存分类失败')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      icon: category.icon || '',
      color: category.color || '#3B82F6',
      order: category.order,
      parentId: category.parentId || '',
      isActive: category.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`确定要删除分类"${category.name}"吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        fetchCategories()
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      toast.error('删除分类失败')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      icon: '',
      color: '#3B82F6',
      order: 0,
      parentId: '',
      isActive: true
    })
    setEditingCategory(null)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const renderTreeView = (categories: Category[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className={`ml-${level * 4}`}>
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {category.icon && (
                  <span className="text-lg">{category.icon}</span>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{category.name}</h3>
                    {!category.isActive && (
                      <Badge variant="secondary">
                        <EyeOff className="w-3 h-3 mr-1" />
                        已禁用
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{category.slug}</p>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                  <div className="flex space-x-4 text-xs text-gray-500 mt-2">
                    <span>视频: {category._count.videos}</span>
                    <span>子分类: {category._count.children}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category)}
                  disabled={category._count.videos > 0 || category._count.children > 0}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {category.children && category.children.length > 0 && (
          <div className="ml-6">
            {renderTreeView(category.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  if (loading) {
    return <div className="flex justify-center p-8">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">分类管理</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label>显示已禁用</Label>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                新建分类
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? '编辑分类' : '新建分类'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">分类名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData({
                        ...formData,
                        name,
                        slug: formData.slug || generateSlug(name)
                      })
                    }}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">标识符 *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">图标</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      placeholder="🎯"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">颜色</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order">排序</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentId">父分类</Label>
                    <Select
                      value={formData.parentId}
                      onValueChange={(value) => setFormData({...formData, parentId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择父分类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">无父分类</SelectItem>
                        {flatCategories
                          .filter(cat => cat.id !== editingCategory?.id)
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.parent ? `${category.parent.name} > ` : ''}{category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label>启用分类</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    {editingCategory ? '更新' : '创建'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'tree' | 'flat')}>
        <TabsList>
          <TabsTrigger value="tree">
            <FolderTree className="w-4 h-4 mr-2" />
            树形视图
          </TabsTrigger>
          <TabsTrigger value="flat">
            <List className="w-4 h-4 mr-2" />
            列表视图
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">暂无分类数据</p>
              </CardContent>
            </Card>
          ) : (
            renderTreeView(categories)
          )}
        </TabsContent>

        <TabsContent value="flat" className="space-y-4">
          {flatCategories.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">暂无分类数据</p>
              </CardContent>
            </Card>
          ) : (
            flatCategories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {category.icon && (
                        <span className="text-lg">{category.icon}</span>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{category.name}</h3>
                          {category.parent && (
                            <Badge variant="outline">
                              {category.parent.name}
                            </Badge>
                          )}
                          {!category.isActive && (
                            <Badge variant="secondary">
                              <EyeOff className="w-3 h-3 mr-1" />
                              已禁用
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{category.slug}</p>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                        <div className="flex space-x-4 text-xs text-gray-500 mt-2">
                          <span>视频: {category._count.videos}</span>
                          <span>子分类: {category._count.children}</span>
                          <span>排序: {category.order}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        disabled={category._count.videos > 0 || category._count.children > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
