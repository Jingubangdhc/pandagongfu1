"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Withdrawal, Commission } from "@prisma/client";
import { Calendar, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/heading";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type WithdrawalWithCommissions = Withdrawal & {
  commissions: Commission[];
};

interface WithdrawalStats {
  totalAmount: number;
  totalCount: number;
  pendingAmount: number;
  pendingCount: number;
  completedAmount: number;
  completedCount: number;
}

interface WithdrawalClientProps {
  withdrawals: WithdrawalWithCommissions[];
  stats: WithdrawalStats;
}

export const WithdrawalClient = ({
  withdrawals,
  stats
}: WithdrawalClientProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const statusMap = {
    PENDING: { label: "处理中", color: "bg-yellow-500" },
    COMPLETED: { label: "已完成", color: "bg-green-500" },
    REJECTED: { label: "已拒绝", color: "bg-red-500" },
  };

  const handleViewDetails = (withdrawalId: string) => {
    router.push(`/dashboard/withdrawals/${withdrawalId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="提现管理"
          description="管理您的提现申请"
        />
      </div>
      <Separator className="my-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总提现金额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {formatPrice(stats.totalAmount)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              共 {stats.totalCount} 笔提现申请
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待处理提现
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {formatPrice(stats.pendingAmount)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              共 {stats.pendingCount} 笔待处理申请
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已完成提现
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {formatPrice(stats.completedAmount)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              共 {stats.completedCount} 笔已完成提现
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {withdrawals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-2">暂无提现记录</p>
            <Button 
              onClick={() => router.push("/dashboard/commissions")}
              variant="outline"
            >
              查看佣金
            </Button>
          </div>
        ) : (
          withdrawals.map((withdrawal) => {
            const status = withdrawal.status as keyof typeof statusMap;
            const statusInfo = statusMap[status] || { label: "未知", color: "bg-gray-500" };
            
            return (
              <Card key={withdrawal.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      提现申请 #{withdrawal.id.substring(0, 8)}
                    </CardTitle>
                    <Badge className={`${statusInfo.color} text-white`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <CardDescription>
                    包含 {withdrawal.commissions.length} 笔佣金
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">提现金额</p>
                        <p className="font-medium">{formatPrice(withdrawal.amount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">申请时间</p>
                        <p className="font-medium">{formatDate(new Date(withdrawal.createdAt))}</p>
                      </div>
                    </div>
                    {withdrawal.completedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">完成时间</p>
                          <p className="font-medium">{formatDate(new Date(withdrawal.completedAt))}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => handleViewDetails(withdrawal.id)}
                      variant="outline"
                      size="sm"
                    >
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};