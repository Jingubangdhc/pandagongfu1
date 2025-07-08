import { Metadata } from 'next'
import WithdrawalManagement from '@/components/admin/WithdrawalManagement'

export const metadata: Metadata = {
  title: 'Withdrawal Management | Pandagongfu-慧 Admin',
  description: 'Manage user withdrawal requests',
}

export default function AdminWithdrawalsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Withdrawal Management</h1>
        <p className="text-muted-foreground">
          Review and process user withdrawal requests
        </p>
      </div>
      <WithdrawalManagement />
    </div>
  )
}
