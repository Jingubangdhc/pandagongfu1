// 客户端文件验证工具 - 不包含Node.js模块

// 支持的文件类型
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/flv',
  'video/webm'
]

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
]

// 文件大小限制 (字节)
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024   // 10MB

export interface UploadResult {
  success: boolean
  filename?: string
  url?: string
  error?: string
  size?: number
  type?: string
}

/**
 * 验证文件类型（增强版）
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  // 检查MIME类型
  if (!allowedTypes.includes(file.type)) {
    return false
  }

  // 检查文件扩展名
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) {
    return false
  }

  // 根据MIME类型验证扩展名
  const allowedExtensions = allowedTypes.map(type => {
    switch (type) {
      case 'image/jpeg': return ['jpg', 'jpeg']
      case 'image/png': return ['png']
      case 'image/gif': return ['gif']
      case 'image/webp': return ['webp']
      case 'video/mp4': return ['mp4']
      case 'video/webm': return ['webm']
      case 'video/quicktime': return ['mov']
      case 'video/x-msvideo': return ['avi']
      case 'video/x-ms-wmv': return ['wmv']
      case 'video/x-flv': return ['flv']
      default: return []
    }
  }).flat()

  return allowedExtensions.includes(extension)
}

/**
 * 验证文件大小
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * 生成唯一文件名
 */
export function generateFileName(originalName: string): string {
  const ext = originalName.substring(originalName.lastIndexOf('.'))
  const uuid = crypto.randomUUID()
  return `${uuid}${ext}`
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 验证文件是否符合要求
 */
export function validateFile(file: File, type: 'video' | 'image'): { isValid: boolean; error?: string } {
  // 验证文件类型
  const allowedTypes = type === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES
  if (!validateFileType(file, allowedTypes)) {
    return {
      isValid: false,
      error: `不支持的${type === 'video' ? '视频' : '图片'}格式`
    }
  }

  // 验证文件大小
  const maxSize = type === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  if (!validateFileSize(file, maxSize)) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return {
      isValid: false,
      error: `文件大小超过限制 (最大 ${maxSizeMB}MB)`
    }
  }

  return { isValid: true }
}

/**
 * 获取文件信息
 */
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  }
}

/**
 * 上传结果类型
 */
export interface UploadResult {
  success: boolean
  error?: string
  filename?: string
  url?: string
  size?: number
  type?: string
  cloudKey?: string
  provider?: string
}

/**
 * 处理文件上传（客户端验证版本）
 */
export async function processFileUpload(
  file: File,
  type: 'video' | 'image'
): Promise<UploadResult> {
  // 验证文件
  const validation = validateFile(file, type)
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    }
  }

  // 生成文件名
  const filename = generateFileName(file.name)

  // 注意：这是客户端版本，不会实际保存文件
  // 实际的文件保存在服务器端的API路由中处理
  return {
    success: true,
    filename,
    size: file.size,
    type: file.type,
    url: `/uploads/${type}s/${filename}` // 本地存储路径
  }
}

