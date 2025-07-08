"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Withdrawal, Commission, User, Order } from "@prisma/client";
import { ArrowLeft, Calendar, CheckCircle, Clock, DollarSign, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type CommissionWithRelations = Commission & {
  fromUser: Pick<User, "id" | "username" | "email" | "avatar">;
  order: Order & {
    items: Array<{
      id: string;
      video: {
        id: string;
        title: string;
        thumbnailUrl: string;
        price: number;
      } | null;
    }>;
  };
};

type WithdrawalWithCommissions = Withdrawal & {
  commissions: CommissionWithRelations[];
};

interface WithdrawalDetailsProps {
  withdrawal: WithdrawalWithCommissions;
}

export const WithdrawalDetails = ({
  withdrawal
}: WithdrawalDetailsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const statusMap = {
    PENDING: { label: "处理中", color: "bg-yellow-500" },
    COMPLETED: { label: "已完成", color: "bg-green-500" },
    REJECTED: { label: "已拒绝", color: "bg-red-500" },
  };

  const status = withdrawal.status as keyof typeof statusMap;
  const statusInfo = statusMap[status] || { label: "未知", color: "bg-gray-500" };

  const handleBack = () => {
    router.push("/dashboard/withdrawals");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button
          onClick={handleBack}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回提现列表
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">提现详情</CardTitle>
            <Badge className={`${statusInfo.color} text-white`}>
              {statusInfo.label}
            </Badge>
          </div>
          <CardDescription>
            提现ID: {withdrawal.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">提现金额</p>
                <p className="font-medium">{formatPrice(withdrawal.amount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">申请时间</p>
                <p className="font-medium">{formatDate(new Date(withdrawal.createdAt))}</p>
              </div>
            </div>
            {withdrawal.updatedAt !== withdrawal.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">更新时间</p>
                  <p className="font-medium">{formatDate(new Date(withdrawal.updatedAt))}</p>
                </div>
              </div>
            )}
            {withdrawal.completedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">完成时间</p>
                  <p className="font-medium">{formatDate(new Date(withdrawal.completedAt))}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-4">包含的佣金 ({withdrawal.commissions.length})</h3>
            <div className="space-y-4">
              {withdrawal.commissions.map((commission) => (
                <Card key={commission.id} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        佣金 #{commission.id.substring(0, 8)}
                      </CardTitle>
                      <p className="text-sm font-medium">
                        {formatPrice(commission.amount)}
                      </p>
                    </div>
                    <CardDescription>
                      创建于 {formatDate(new Date(commission.createdAt))}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {commission.fromUser.avatar ? (
                          <img
                            src={commission.fromUser.avatar}
                            alt={commission.fromUser.username || "用户头像"}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{commission.fromUser.username || "未知用户"}</p>
                          <p className="text-xs text-muted-foreground">{commission.fromUser.email}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">订单信息</p>
                        <div className="text-xs">订单ID: {commission.order.id.substring(0, 8)}</div>
                        <div className="mt-2 space-y-2">
                          {commission.order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-2 bg-background p-2 rounded-md">
                              {item.video?.thumbnailUrl && (
                                <img 
                                  src={item.video.thumbnailUrl} 
                                  alt={item.video.title} 
                                  className="h-8 w-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-medium">{item.video?.title || "未知视频"}</p>
                                <p className="text-xs text-muted-foreground">
                                  价格: {item.video ? formatPrice(item.video.price) : "未知"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            onClick={handleBack}
            variant="outline"
          >
            返回
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
