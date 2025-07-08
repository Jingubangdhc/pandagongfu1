"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  File, 
  Video, 
  Image, 
  X, 
  Check, 
  AlertCircle,
  Cloud,
  HardDrive
} from 'lucide-react'
import { formatFileSize } from '@/lib/upload'
import { useToast } from '@/hooks/use-toast'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  url?: string
  cloudKey?: string
  provider?: 'aws' | 'aliyun'
}

interface FileUploadProps {
  type: 'video' | 'image'
  onUploadComplete?: (files: UploadFile[]) => void
}

export function FileUpload({ type, onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploadMode, setUploadMode] = useState<'local' | 'cloud'>('local')
  const [cloudProvider, setCloudProvider] = useState<'aws' | 'aliyun'>('aws')
  const { toast } = useToast()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: type === 'video' 
      ? { 'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'] }
      : { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: type === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024 // 500MB for video, 10MB for image
  })

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData()
    formData.append('file', uploadFile.file)
    formData.append('type', type)
    
    if (uploadMode === 'cloud') {
      formData.append('provider', cloudProvider)
    }

    const endpoint = uploadMode === 'cloud' ? '/api/upload/cloud' : '/api/upload'

    try {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
        ))
      }, 200)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      const result = await response.json()
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'success', 
              progress: 100,
              url: result.data.url,
              cloudKey: result.data.cloudKey,
              provider: result.data.provider
            }
          : f
      ))

      toast({
        title: "上传成功",
        description: `${uploadFile.file.name} 上传完成`,
      })

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error', 
              progress: 0,
              error: error instanceof Error ? error.message : '上传失败'
            }
          : f
      ))

      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : '上传失败',
        variant: "destructive",
      })
    }
  }

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (const file of pendingFiles) {
      await uploadFile(file)
    }

    const successFiles = files.filter(f => f.status === 'success')
    onUploadComplete?.(successFiles)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const retryUpload = (id: string) => {
    const file = files.find(f => f.id === id)
    if (file) {
      uploadFile(file)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) {
      return <Video className="h-8 w-8 text-blue-500" />
    }
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-green-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {type === 'video' ? '视频上传' : '图片上传'}
        </CardTitle>
        <CardDescription>
          支持拖拽上传，{type === 'video' ? '最大500MB' : '最大10MB'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 上传模式选择 */}
        <Tabs value={uploadMode} onValueChange={(value) => setUploadMode(value as 'local' | 'cloud')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              本地存储
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              云存储
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cloud" className="mt-4">
            <div className="flex gap-2">
              <Button
                variant={cloudProvider === 'aws' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCloudProvider('aws')}
              >
                AWS S3
              </Button>
              <Button
                variant={cloudProvider === 'aliyun' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCloudProvider('aliyun')}
              >
                阿里云OSS
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* 拖拽上传区域 */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 md:p-8 text-center cursor-pointer transition-colors touch-manipulation
            ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }
            min-h-[200px] md:min-h-[240px] flex flex-col items-center justify-center
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-base md:text-lg font-medium">释放文件开始上传...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-base md:text-lg font-medium mb-2">
                <span className="hidden md:inline">拖拽文件到这里，或</span>
                <span className="md:hidden">点击</span>
                点击选择文件
              </p>
              <p className="text-xs md:text-sm text-gray-500 px-4">
                支持 {type === 'video' ? 'MP4, AVI, MOV, WMV, FLV, WebM' : 'JPEG, PNG, GIF, WebP'} 格式
              </p>
              <p className="text-xs text-gray-400">
                最大文件大小: {type === 'video' ? '500MB' : '10MB'}
              </p>
            </div>
          )}
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">文件列表 ({files.length})</h3>
              <Button 
                onClick={uploadAllFiles}
                disabled={files.every(f => f.status !== 'pending')}
              >
                上传所有文件
              </Button>
            </div>
            
            <div className="space-y-3">
              {files.map((uploadFile) => (
                <div key={uploadFile.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(uploadFile.file)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {uploadFile.file.name}
                        </p>
                        {getStatusIcon(uploadFile.status)}
                        <Badge variant={
                          uploadFile.status === 'success' ? 'default' :
                          uploadFile.status === 'error' ? 'destructive' :
                          uploadFile.status === 'uploading' ? 'secondary' : 'outline'
                        }>
                          {uploadFile.status === 'pending' && '等待上传'}
                          {uploadFile.status === 'uploading' && '上传中'}
                          {uploadFile.status === 'success' && '上传成功'}
                          {uploadFile.status === 'error' && '上传失败'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="mt-2" />
                      )}
                      {uploadFile.error && (
                        <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                      )}
                      {uploadFile.url && (
                        <p className="text-xs text-green-600 mt-1">
                          URL: {uploadFile.url}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {uploadFile.status === 'error' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryUpload(uploadFile.id)}
                        >
                          重试
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadFile.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
