"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronDown,
  Download,
  Filter,
  Search
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// 提现状态类型
type WithdrawalStatus = 'all' | 'pending' | 'processing' | 'completed' | 'rejected'

// 提现记录类型
interface Withdrawal {
  id: string
  amount: number
  date: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  paymentMethod: string
  accountName: string
  accountNumber: string
}

// 从API获取提现记录
async function fetchWithdrawals() {
  try {
    const response = await fetch('/api/withdrawals')
    if (!response.ok) {
      throw new Error('获取提现记录失败')
    }
    return await response.json()
  } catch (error) {
    console.error('获取提现记录失败:', error)
    return []
  }
}

// 获取状态对应的中文名称和样式
function getStatusInfo(status: string) {
  switch (status) {
    case 'pending':
      return { label: '待处理', className: 'bg-blue-100 text-blue-700' }
    case 'processing':
      return { label: '处理中', className: 'bg-yellow-100 text-yellow-700' }
    case 'completed':
      return { label: '已完成', className: 'bg-green-100 text-green-700' }
    case 'rejected':
      return { label: '已拒绝', className: 'bg-red-100 text-red-700' }
    default:
      return { label: '未知', className: 'bg-gray-100 text-gray-700' }
  }
}

export function WithdrawalHistory() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWithdrawals = async () => {
      setIsLoading(true)
      try {
        const data = await fetchWithdrawals()
        setWithdrawals(data.map((w: any) => ({
          id: w.id,
          amount: w.amount,
          date: new Date(w.createdAt).toISOString().split('T')[0],
          status: w.status.toLowerCase(),
          paymentMethod: w.method.toLowerCase(),
          accountName: w.accountInfo.name || '未提供',
          accountNumber: w.accountInfo.number || w.accountInfo.email || '未提供'
        })))
      } catch (err) {
        setError('获取提现记录失败，请稍后重试')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadWithdrawals()
  }, [])
  
  // 筛选状态
  const [status, setStatus] = useState<WithdrawalStatus>('all')
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<string>('all')
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  // 筛选提现记录
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          重试
        </Button>
      </div>
    )
  }

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    // 按状态筛选
    if (status !== 'all' && withdrawal.status !== status) {
      return false
    }
    
    // 按日期范围筛选
    if (dateRange.from) {
      const withdrawalDate = new Date(withdrawal.date)
      if (withdrawalDate < dateRange.from) {
        return false
      }
    }
    
    if (dateRange.to) {
      const withdrawalDate = new Date(withdrawal.date)
      if (withdrawalDate > dateRange.to) {
        return false
      }
    }
    
    // 按支付方式筛选
    if (paymentMethod !== 'all' && withdrawal.paymentMethod !== paymentMethod) {
      return false
    }
    
    // 按搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        withdrawal.id.toLowerCase().includes(query) ||
        withdrawal.accountName.toLowerCase().includes(query) ||
        withdrawal.accountNumber.toLowerCase().includes(query)
      )
    }
    
    return true
  })
  
  // 计算分页
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage)
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  // 重置筛选条件
  const resetFilters = () => {
    setStatus('all')
    setDateRange({ from: undefined, to: undefined })
    setSearchQuery('')
    setPaymentMethod('all')
    setCurrentPage(1)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>提现记录</CardTitle>
        <CardDescription>
          查看和管理您的所有提现申请
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 筛选工具栏 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索提现ID或账户信息"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={status} onValueChange={(value) => setStatus(value as WithdrawalStatus)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="提现方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部方式</SelectItem>
                  <SelectItem value="alipay">支付宝</SelectItem>
                  <SelectItem value="wechat">微信支付</SelectItem>
                  <SelectItem value="bank">银行卡</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-[180px]",
                      !dateRange.from && !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "yyyy-MM-dd")} -{" "}
                          {format(dateRange.to, "yyyy-MM-dd")}
                        </>
                      ) : (
                        format(dateRange.from, "yyyy-MM-dd")
                      )
                    ) : (
                      "选择日期范围"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              
              <Button variant="ghost" onClick={resetFilters} size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 提现记录列表 */}
          {paginatedWithdrawals.length > 0 ? (
            <div className="space-y-4">
              {paginatedWithdrawals.map((withdrawal) => {
                const statusInfo = getStatusInfo(withdrawal.status)
                
                return (
                  <div 
                    key={withdrawal.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="mb-2 sm:mb-0">
                      <h4 className="font-medium">{withdrawal.id}</h4>
                      <p className="text-sm text-muted-foreground">
                        申请时间：{withdrawal.date}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.paymentMethod === 'alipay' ? '支付宝' : 
                         withdrawal.paymentMethod === 'wechat' ? '微信支付' : '银行卡'}：
                        {withdrawal.accountNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(withdrawal.amount)}</div>
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <span className={`text-xs px-2 py-1 rounded ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/withdrawals/${withdrawal.id}`}>查看详情</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* 分页控制 */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-muted-foreground">
                    显示 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)} 条，共 {filteredWithdrawals.length} 条
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">没有找到符合条件的提现记录</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          导出记录
        </Button>
        <Button asChild>
          <Link href="/dashboard/withdrawals/new">申请新提现</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}