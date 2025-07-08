"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/utils";

interface CommissionStats {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  monthlyEarnings: number;
  totalReferrals: number;
}

interface Commission {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  order: {
    id: string;
    items: {
      id: string;
      video: {
        id: string;
        title: string;
        thumbnailUrl: string;
      };
    }[];
  };
}

export default function CommissionClient() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<string>(searchParams.get("filter") || "all");
  const [page, setPage] = useState<number>(parseInt(searchParams.get("page") || "1"));
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);

  // 获取佣金统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/commissions/stats");
        if (!response.ok) {
          throw new Error("获取佣金统计失败");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("获取佣金统计失败:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 获取佣金列表
  useEffect(() => {
    const fetchCommissions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/commissions?filter=${filter}&page=${page}`);
        if (!response.ok) {
          throw new Error("获取佣金列表失败");
        }
        const data = await response.json();
        setCommissions(data.commissions);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("获取佣金列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, [filter, page]);

  // 处理筛选变化
  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  // 获取佣金状态显示
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">待确认</Badge>;
      case "CONFIRMED":
        return <Badge variant="secondary">已确认</Badge>;
      case "PAID":
        return <Badge variant="success">已结算</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">已取消</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 佣金统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总收益</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                {formatPrice(stats?.totalEarnings || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">待结算</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                {formatPrice(stats?.pendingEarnings || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">本月收益</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                {formatPrice(stats?.monthlyEarnings || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">推荐人数</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.totalReferrals || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 佣金列表 */}
      <Card>
        <CardHeader>
          <CardTitle>佣金记录</CardTitle>
          <CardDescription>查看您的所有佣金记录</CardDescription>
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="pending">待确认</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="paid">已结算</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">暂无佣金记录</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>课程</TableHead>
                    <TableHead>推荐用户</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {commission.order.items[0]?.video.title || "未知课程"}
                      </TableCell>
                      <TableCell>{commission.fromUser.name}</TableCell>
                      <TableCell>{formatPrice(commission.amount)}</TableCell>
                      <TableCell>{getStatusDisplay(commission.status)}</TableCell>
                      <TableCell>{formatDate(new Date(commission.createdAt))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPage(Math.max(1, page - 1))}
                          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink 
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}