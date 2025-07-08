import fs from 'fs/promises'
import path from 'path'
import { validateFile, generateFileName } from './upload'

/**
 * 上传结果类型
 */
export interface FileStorageResult {
  success: boolean
  error?: string
  filename?: string
  url?: string
  size?: number
  type?: string
}

/**
 * 保存文件到本地存储（仅服务器端）
 */
export async function saveFileToLocal(
  file: File,
  type: 'video' | 'image'
): Promise<FileStorageResult> {
  try {
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
    
    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', `${type}s`)
    
    try {
      await fs.mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 保存文件
    const filePath = path.join(uploadDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    return {
      success: true,
      filename,
      size: file.size,
      type: file.type,
      url: `/uploads/${type}s/${filename}`
    }
  } catch (error) {
    console.error('本地文件保存失败:', error)
    return {
      success: false,
      error: '文件保存失败'
    }
  }
}
