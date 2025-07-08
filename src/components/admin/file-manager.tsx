"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  File, 
  Video, 
  Image, 
  MoreHorizontal,
  Search,
  Download,
  Trash2,
  Eye,
  Copy
} from 'lucide-react'
import { formatFileSize } from '@/lib/upload'
import { useToast } from '@/hooks/use-toast'

interface FileItem {
  id: string
  filename: string
  originalName: string
  url: string
  size: number
  type: string
  uploadedAt: string
  uploadedBy: string
  cloudKey?: string
  provider?: 'aws' | 'aliyun'
}

interface FileManagerProps {
  type?: 'video' | 'image' | 'all'
}

export function FileManager({ type = 'all' }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchFiles = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (type !== 'all') {
        params.append('type', type)
      }
      
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/upload?${params}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('获取文件列表失败')
      }

      const data = await response.json()
      setFiles(data.files || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      toast({
        title: "获取文件列表失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles(currentPage, searchTerm)
  }, [currentPage, type])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchFiles(1, searchTerm)
  }

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`确定要删除文件 "${file.originalName}" 吗？`)) {
      return
    }

    try {
      let endpoint = `/api/upload/${file.filename}`
      const params = new URLSearchParams()
      
      if (file.type.startsWith('video/')) {
        params.append('type', 'video')
      } else {
        params.append('type', 'image')
      }

      // 如果是云存储文件，使用云存储删除接口
      if (file.cloudKey && file.provider) {
        endpoint = '/api/upload/cloud'
        params.append('key', file.cloudKey)
        params.append('provider', file.provider)
      }

      const response = await fetch(`${endpoint}?${params}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('删除文件失败')
      }

      toast({
        title: "删除成功",
        description: `文件 "${file.originalName}" 已删除`,
      })

      // 刷新文件列表
      fetchFiles(currentPage, searchTerm)
    } catch (error) {
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive",
      })
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "复制成功",
      description: "文件URL已复制到剪贴板",
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('video/')) {
      return <Video className="h-4 w-4 text-blue-500" />
    }
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-green-500" />
    }
    return <File className="h-4 w-4 text-gray-500" />
  }

  const getProviderBadge = (provider?: string) => {
    if (!provider) return null
    
    return (
      <Badge variant="outline" className="text-xs">
        {provider === 'aws' ? 'AWS S3' : provider === 'aliyun' ? '阿里云OSS' : '本地'}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          文件管理
        </CardTitle>
        <CardDescription>
          管理已上传的{type === 'video' ? '视频' : type === 'image' ? '图片' : ''}文件
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜索栏 */}
        <div className="flex gap-2 md:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索文件名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-10 md:h-9 text-base md:text-sm touch-manipulation"
              style={{ fontSize: '16px' }} // 防止iOS缩放
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-10 md:h-9 px-3 touch-manipulation"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">搜索</span>
          </Button>
        </div>

        {/* 文件表格 */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>文件</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>存储</TableHead>
                <TableHead>上传时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    暂无文件
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{file.filename}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{file.type}</Badge>
                    </TableCell>
                    <TableCell>{getProviderBadge(file.provider)}</TableCell>
                    <TableCell>
                      {new Date(file.uploadedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            预览
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyUrl(file.url)}>
                            <Copy className="h-4 w-4 mr-2" />
                            复制链接
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                            <Download className="h-4 w-4 mr-2" />
                            下载
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(file)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="flex items-center px-3 text-sm">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
