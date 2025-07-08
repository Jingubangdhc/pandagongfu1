import AWS from 'aws-sdk'
import OSS from 'ali-oss'

// 云存储配置检查
export const USE_CLOUD_STORAGE = process.env.USE_CLOUD_STORAGE === 'true'
export const CLOUD_STORAGE_PROVIDER = process.env.CLOUD_STORAGE_PROVIDER || 'aws'

// AWS S3 配置
const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET,
  endpoint: process.env.AWS_S3_ENDPOINT
}

// 阿里云OSS配置
const ossConfig = {
  accessKeyId: process.env.ALIBABA_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIBABA_ACCESS_KEY_SECRET,
  region: process.env.ALIBABA_OSS_REGION || 'oss-cn-hangzhou',
  bucket: process.env.ALIBABA_OSS_BUCKET,
  endpoint: process.env.ALIBABA_OSS_ENDPOINT
}

export interface CloudUploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
  provider?: 'aws' | 'aliyun'
}

/**
 * AWS S3 上传
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<CloudUploadResult> {
  try {
    if (!s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.bucket) {
      return {
        success: false,
        error: 'AWS S3 配置不完整'
      }
    }

    const s3 = new AWS.S3({
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
      region: s3Config.region
    })

    const params = {
      Bucket: s3Config.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read'
    }

    const result = await s3.upload(params).promise()

    return {
      success: true,
      url: result.Location,
      key: result.Key,
      provider: 'aws'
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: 'AWS S3 上传失败',
      provider: 'aws'
    }
  }
}

/**
 * 阿里云OSS上传
 */
export async function uploadToOSS(
  file: Buffer,
  key: string,
  contentType: string
): Promise<CloudUploadResult> {
  try {
    if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret || !ossConfig.bucket) {
      return {
        success: false,
        error: '阿里云OSS配置不完整'
      }
    }

    const client = new OSS({
      accessKeyId: ossConfig.accessKeyId,
      accessKeySecret: ossConfig.accessKeySecret,
      region: ossConfig.region,
      bucket: ossConfig.bucket
    })

    const result = await client.put(key, file, {
      headers: {
        'Content-Type': contentType
      }
    })

    return {
      success: true,
      url: result.url,
      key: result.name,
      provider: 'aliyun'
    }
  } catch (error) {
    console.error('OSS upload error:', error)
    return {
      success: false,
      error: '阿里云OSS上传失败',
      provider: 'aliyun'
    }
  }
}

/**
 * 智能选择云存储提供商
 */
export async function uploadToCloud(
  file: Buffer,
  key: string,
  contentType: string,
  preferredProvider?: 'aws' | 'aliyun'
): Promise<CloudUploadResult> {
  // 如果指定了提供商，直接使用
  if (preferredProvider === 'aws') {
    return uploadToS3(file, key, contentType)
  }
  
  if (preferredProvider === 'aliyun') {
    return uploadToOSS(file, key, contentType)
  }

  // 自动选择：优先使用配置完整的服务
  const hasS3Config = s3Config.accessKeyId && s3Config.secretAccessKey && s3Config.bucket
  const hasOSSConfig = ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket

  if (hasS3Config && !hasOSSConfig) {
    return uploadToS3(file, key, contentType)
  }
  
  if (hasOSSConfig && !hasS3Config) {
    return uploadToOSS(file, key, contentType)
  }
  
  if (hasS3Config && hasOSSConfig) {
    // 两个都配置了，优先使用S3
    return uploadToS3(file, key, contentType)
  }

  return {
    success: false,
    error: '未配置任何云存储服务'
  }
}

/**
 * 从S3删除文件
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    if (!s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.bucket) {
      return false
    }

    const s3 = new AWS.S3({
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
      region: s3Config.region
    })

    await s3.deleteObject({
      Bucket: s3Config.bucket,
      Key: key
    }).promise()

    return true
  } catch (error) {
    console.error('S3 delete error:', error)
    return false
  }
}

/**
 * 从OSS删除文件
 */
export async function deleteFromOSS(key: string): Promise<boolean> {
  try {
    if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret || !ossConfig.bucket) {
      return false
    }

    const client = new OSS({
      accessKeyId: ossConfig.accessKeyId,
      accessKeySecret: ossConfig.accessKeySecret,
      region: ossConfig.region,
      bucket: ossConfig.bucket
    })

    await client.delete(key)
    return true
  } catch (error) {
    console.error('OSS delete error:', error)
    return false
  }
}

/**
 * 从云存储删除文件
 */
export async function deleteFromCloud(
  key: string,
  provider: 'aws' | 'aliyun'
): Promise<boolean> {
  if (provider === 'aws') {
    return deleteFromS3(key)
  }
  
  if (provider === 'aliyun') {
    return deleteFromOSS(key)
  }
  
  return false
}

/**
 * 生成云存储文件路径
 */
export function generateCloudKey(
  type: 'video' | 'image',
  filename: string,
  userId?: string
): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  const basePath = `${type}s/${year}/${month}/${day}`
  
  if (userId) {
    return `${basePath}/${userId}/${filename}`
  }
  
  return `${basePath}/${filename}`
}
