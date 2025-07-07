import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化价格
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(price)
}

// 格式化时间
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 格式化日期
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// 生成随机ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// 验证邮箱
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证手机号
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 截取文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

// 生成分享链接（带推荐码）
export function generateShareLink(userId: string, videoId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const path = videoId ? `/video/${videoId}` : '/courses'
  return `${baseUrl}${path}?ref=${userId}`
}

// 生成推荐码
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 计算多级佣金
export async function calculateCommission(
  orderAmount: number,
  referrerId: string,
  tx: any
): Promise<Array<{ userId: string; amount: number; level: number }>> {
  const commissions = []
  let currentReferrerId = referrerId
  let level = 1

  // 一级佣金 15%
  if (level === 1 && currentReferrerId) {
    commissions.push({
      userId: currentReferrerId,
      amount: orderAmount * 0.15,
      level: 1
    })

    // 查找二级推荐人
    const referrer = await tx.user.findUnique({
      where: { id: currentReferrerId },
      select: { referrerId: true }
    })

    currentReferrerId = referrer?.referrerId || null
    level = 2
  }

  // 二级佣金 5%
  if (level === 2 && currentReferrerId) {
    commissions.push({
      userId: currentReferrerId,
      amount: orderAmount * 0.05,
      level: 2
    })
  }

  return commissions
}

// 简单佣金计算（向后兼容）
export function calculateSimpleCommission(price: number, rate: number): number {
  return Math.round(price * rate * 100) / 100
}
