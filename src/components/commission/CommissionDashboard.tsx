'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Download,
  Eye
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatPrice } from '@/lib/utils'
import WithdrawalForm from './WithdrawalForm'

interface CommissionStats {
  totalEarnings: number
  pendingEarnings: number
  paidEarnings: number
  monthlyEarnings: number
  referralCount: number
  commissionCount: number
  recentCommissions: Array<{
    id: string
    amount: number
    status: string
    level: number
    createdAt: string
    fromUser: {
      id: string
      username: string
      email: string
      avatar: string | null
    }
  }>
}

interface Commission {
  id: string
  amount: number
  status: string
  level: number
  createdAt: string
  fromUser: {
    id: string
    username: string
    email: string
    avatar: string | null
  }
}

interface CommissionListResponse {
  commissions: Commission[]
  totalPages: number
  currentPage: number
  totalCount: number
}

export default function CommissionDashboard() {
  const [stats, setStats] = useState<CommissionStats | null>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchCommissions()
  }, [filter, currentPage])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/commissions/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch commission stats:', error)
    }
  }

  const fetchCommissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/commissions?filter=${filter}&page=${currentPage}`)
      if (response.ok) {
        const data: CommissionListResponse = await response.json()
        setCommissions(data.commissions)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Pending', variant: 'secondary' as const },
      CONFIRMED: { label: 'Confirmed', variant: 'default' as const },
      PAID: { label: 'Paid', variant: 'success' as const },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleWithdrawalSuccess = () => {
    setShowWithdrawalForm(false)
    // Refresh stats to update available balance
    fetchStats()
  }

  if (!stats) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              All time commission earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.pendingEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.monthlyEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              This month's commissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.referralCount}</div>
            <p className="text-xs text-muted-foreground">
              Total referred users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Management */}
      <Tabs defaultValue="commissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commissions">Commission History</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commission History</CardTitle>
                  <CardDescription>
                    View and manage your commission earnings
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="paid">Paid</option>
                  </select>
                  {stats.pendingEarnings > 0 && (
                    <Dialog open={showWithdrawalForm} onOpenChange={setShowWithdrawalForm}>
                      <DialogTrigger asChild>
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Request Withdrawal
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Withdrawal Request</DialogTitle>
                        </DialogHeader>
                        <WithdrawalForm
                          availableBalance={stats.pendingEarnings}
                          onSuccess={handleWithdrawalSuccess}
                          onCancel={() => setShowWithdrawalForm(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : commissions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No commission records found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            L{commission.level}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{commission.fromUser.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(commission.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(commission.amount)}</p>
                          {getStatusBadge(commission.status)}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>
                View your withdrawal requests and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground">Withdrawal management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
