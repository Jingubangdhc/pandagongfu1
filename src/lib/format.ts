/**
 * 格式化价格为人民币格式
 * @param price 价格数值
 * @returns 格式化后的价格字符串，例如 "¥100.00"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * 格式化日期为本地格式
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期字符串，例如 "2023年10月15日"
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * 格式化日期时间为本地格式
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期时间字符串，例如 "2023年10月15日 14:30:25"
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObj);
}

/**
 * 格式化数字为千分位格式
 * @param num 数字
 * @returns 格式化后的数字字符串，例如 "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('zh-CN').format(num);
}

/**
 * 格式化百分比
 * @param value 百分比值（0-1之间的小数）
 * @param digits 小数位数
 * @returns 格式化后的百分比字符串，例如 "12.34%"
 */
export function formatPercent(value: number, digits: number = 2): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}