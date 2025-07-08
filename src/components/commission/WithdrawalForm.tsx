'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface WithdrawalFormProps {
  availableBalance: number
  onSuccess?: () => void
  onCancel?: () => void
}

interface AccountInfo {
  accountName: string
  accountNumber: string
  bankName?: string
  notes?: string
}

export default function WithdrawalForm({ 
  availableBalance, 
  onSuccess, 
  onCancel 
}: WithdrawalFormProps) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('')
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    accountName: '',
    accountNumber: '',
    bankName: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const feeRate = 0.02 // 2% fee
  const withdrawalAmount = parseFloat(amount) || 0
  const fee = withdrawalAmount * feeRate
  const actualAmount = withdrawalAmount - fee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!amount || withdrawalAmount <= 0) {
        throw new Error('Please enter a valid withdrawal amount')
      }

      if (withdrawalAmount > availableBalance) {
        throw new Error('Withdrawal amount exceeds available balance')
      }

      if (!method) {
        throw new Error('Please select a withdrawal method')
      }

      if (!accountInfo.accountName || !accountInfo.accountNumber) {
        throw new Error('Please provide complete account information')
      }

      if (method === 'BANK_CARD' && !accountInfo.bankName) {
        throw new Error('Bank name is required for bank card withdrawals')
      }

      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: withdrawalAmount,
          method,
          accountInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create withdrawal request')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Withdrawal Request Submitted</h3>
              <p className="text-sm text-muted-foreground">
                Your withdrawal request has been submitted successfully. 
                It will be processed within 1-3 business days.
              </p>
            </div>
            <Button onClick={onSuccess} className="w-full">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
        <CardDescription>
          Available balance: {formatPrice(availableBalance)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading}
            />
            {withdrawalAmount > 0 && (
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Withdrawal amount:</span>
                  <span>{formatPrice(withdrawalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing fee (2%):</span>
                  <span>-{formatPrice(fee)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>You will receive:</span>
                  <span>{formatPrice(actualAmount)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Withdrawal Method</Label>
            <Select value={method} onValueChange={setMethod} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select withdrawal method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_CARD">Bank Card</SelectItem>
                <SelectItem value="ALIPAY">Alipay</SelectItem>
                <SelectItem value="WECHAT_PAY">WeChat Pay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={accountInfo.accountName}
              onChange={(e) => setAccountInfo(prev => ({ ...prev, accountName: e.target.value }))}
              placeholder="Account holder name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountInfo.accountNumber}
              onChange={(e) => setAccountInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="Account number"
              disabled={loading}
            />
          </div>

          {method === 'BANK_CARD' && (
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={accountInfo.bankName}
                onChange={(e) => setAccountInfo(prev => ({ ...prev, bankName: e.target.value }))}
                placeholder="Bank name"
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={accountInfo.notes}
              onChange={(e) => setAccountInfo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !amount || !method}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
