'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, Check, X, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Withdrawal {
  id: string
  amount: number
  fee: number
  actualAmount: number
  method: string
  status: string
  remark?: string
  processedAt?: string
  createdAt: string
  user: {
    id: string
    username: string
    email: string
    phone?: string
  }
}

interface WithdrawalStats {
  [key: string]: {
    count: number
    totalAmount: number
  }
}

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [stats, setStats] = useState<WithdrawalStats>({})
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/withdrawals?page=${currentPage}&status=${selectedStatus}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals')
      }

      const data = await response.json()
      setWithdrawals(data.withdrawals)
      setStats(data.stats)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [currentPage, selectedStatus])

  const handleStatusUpdate = async (withdrawalId: string, status: string, remark?: string) => {
    try {
      setProcessing(true)
      const response = await fetch(`/api/withdrawals/${withdrawalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, remark }),
      })

      if (!response.ok) {
        throw new Error('Failed to update withdrawal status')
      }

      await fetchWithdrawals()
      setSelectedWithdrawal(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pending', variant: 'secondary' as const },
      PROCESSING: { label: 'Processing', variant: 'default' as const },
      COMPLETED: { label: 'Completed', variant: 'default' as const },
      REJECTED: { label: 'Rejected', variant: 'destructive' as const },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getMethodLabel = (method: string) => {
    const methods = {
      BANK_CARD: 'Bank Card',
      ALIPAY: 'Alipay',
      WECHAT_PAY: 'WeChat Pay',
    }
    return methods[method as keyof typeof methods] || method
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([status, data]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.count}</div>
              <p className="text-xs text-muted-foreground">
                {formatPrice(data.totalAmount)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Withdrawals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>
            Manage user withdrawal requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{withdrawal.user.username}</span>
                    <span className="text-sm text-muted-foreground">
                      ({withdrawal.user.email})
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{formatPrice(withdrawal.amount)}</span>
                    <span>via {getMethodLabel(withdrawal.method)}</span>
                    <span>{new Date(withdrawal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(withdrawal.status)}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Withdrawal Details</DialogTitle>
                      </DialogHeader>
                      {selectedWithdrawal && (
                        <WithdrawalDetailModal
                          withdrawal={selectedWithdrawal}
                          onStatusUpdate={handleStatusUpdate}
                          processing={processing}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface WithdrawalDetailModalProps {
  withdrawal: Withdrawal
  onStatusUpdate: (id: string, status: string, remark?: string) => void
  processing: boolean
}

function WithdrawalDetailModal({ withdrawal, onStatusUpdate, processing }: WithdrawalDetailModalProps) {
  const [remark, setRemark] = useState('')

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pending', variant: 'secondary' as const },
      PROCESSING: { label: 'Processing', variant: 'default' as const },
      COMPLETED: { label: 'Completed', variant: 'default' as const },
      REJECTED: { label: 'Rejected', variant: 'destructive' as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Amount:</span>
          <span>{formatPrice(withdrawal.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Fee:</span>
          <span>{formatPrice(withdrawal.fee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Actual Amount:</span>
          <span className="font-medium">{formatPrice(withdrawal.actualAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Method:</span>
          <span>{withdrawal.method}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge(withdrawal.status)}
        </div>
      </div>

      {withdrawal.status === 'PENDING' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Remark (Optional)</label>
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add a remark..."
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => onStatusUpdate(withdrawal.id, 'COMPLETED', remark)}
              disabled={processing}
              className="flex-1"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => onStatusUpdate(withdrawal.id, 'REJECTED', remark)}
              disabled={processing}
              className="flex-1"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
              Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
