"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Commission, User, Order } from "@prisma/client";
import { ArrowLeft, Calendar, CheckCircle, Clock, DollarSign, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/utils";

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

interface CommissionDetailsProps {
  commission: CommissionWithRelations;
}

export const CommissionDetails = ({
  commission
}: CommissionDetailsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const statusMap = {
    PENDING: { label: "待确认", color: "bg-yellow-500" },
    CONFIRMED: { label: "已确认", color: "bg-blue-500" },
    PAID: { label: "已结算", color: "bg-green-500" },
    REJECTED: { label: "已拒绝", color: "bg-red-500" },
  };

  const status = commission.status as keyof typeof statusMap;
  const statusInfo = statusMap[status] || { label: "未知", color: "bg-gray-500" };

  const handleBack = () => {
    router.push("/dashboard/commissions");
  };

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      const response = await fetch("/api/commissions/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commissionIds: [commission.id],
        }),
      });

      if (!response.ok) {
        throw new Error("提现申请失败");
      }

      router.refresh();
      router.push("/dashboard/commissions");
    } catch (error) {
      console.error("提现申请错误:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Button
          onClick={handleBack}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回佣金列表
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">佣金详情</CardTitle>
            <Badge className={`${statusInfo.color} text-white`}>
              {statusInfo.label}
            </Badge>
          </div>
          <CardDescription>
            佣金ID: {commission.id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">佣金金额</p>
                <p className="font-medium">{formatPrice(commission.amount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">创建时间</p>
                <p className="font-medium">{formatDate(new Date(commission.createdAt))}</p>
              </div>
            </div>
            {commission.updatedAt !== commission.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">更新时间</p>
                  <p className="font-medium">{formatDate(new Date(commission.updatedAt))}</p>
                </div>
              </div>
            )}
            {commission.paidAt && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">结算时间</p>
                  <p className="font-medium">{formatDate(new Date(commission.paidAt))}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">推荐人信息</h3>
            <div className="flex items-center gap-3">
              {commission.fromUser.avatar ? (
                <img
                  src={commission.fromUser.avatar}
                  alt={commission.fromUser.username || "用户头像"}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="font-medium">{commission.fromUser.username || "未知用户"}</p>
                <p className="text-sm text-muted-foreground">{commission.fromUser.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">订单信息</h3>
            <p className="text-sm text-muted-foreground mb-2">订单ID: {commission.order.id}</p>
            <div className="space-y-3">
              {commission.order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-md">
                  {item.video?.thumbnailUrl && (
                    <img 
                      src={item.video.thumbnailUrl} 
                      alt={item.video.title} 
                      className="h-12 w-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.video?.title || "未知视频"}</p>
                    <p className="text-sm text-muted-foreground">
                      价格: {item.video ? formatPrice(item.video.price) : "未知"}
                    </p>
                  </div>
                </div>
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
          {(status === "PENDING" || status === "CONFIRMED") && (
            <Button
              disabled={isLoading || isWithdrawing}
              onClick={handleWithdraw}
              variant="default"
            >
              {isWithdrawing ? "处理中..." : "申请提现"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};