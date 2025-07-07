"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useCart } from '@/components/providers'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function CartPage() {
  const { items, removeItem, clearCart, getTotalPrice, getTotalItems } = useCart()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleRemoveItem = (videoId: string) => {
    removeItem(videoId)
    toast({
      title: "已移除",
      description: "商品已从购物车中移除",
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "购物车已清空",
      description: "所有商品已从购物车中移除",
    })
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "购物车为空",
        description: "请先添加商品到购物车",
        variant: "destructive",
      })
      return
    }
    
    // 跳转到结账页面
    window.location.href = '/checkout'
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        
        <div className="container py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">购物车为空</h2>
              <p className="text-muted-foreground mb-6">
                您还没有添加任何课程到购物车
              </p>
              <Button asChild>
                <Link href="/courses">浏览课程</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">购物车</h1>
          <p className="text-muted-foreground">
            您有 {getTotalItems()} 门课程在购物车中
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 购物车商品列表 */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>购物车商品</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-destructive hover:text-destructive"
                >
                  清空购物车
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.videoId} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="shrink-0">
                      <Image
                        src={item.thumbnail || '/api/placeholder/120/68'}
                        alt={item.title}
                        width={120}
                        height={68}
                        className="rounded object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        数字课程 • 永久访问
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-lg font-semibold text-primary">
                          {formatPrice(item.price)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(item.videoId)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 推荐课程 */}
            <Card>
              <CardHeader>
                <CardTitle>您可能还喜欢</CardTitle>
                <CardDescription>基于您的购物车推荐</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: '10',
                      title: '高级太极拳技法精讲',
                      price: 199,
                      originalPrice: 299,
                      thumbnail: '/api/placeholder/200/112'
                    },
                    {
                      id: '11',
                      title: '八段锦完整教学',
                      price: 89,
                      originalPrice: 149,
                      thumbnail: '/api/placeholder/200/112'
                    }
                  ].map((course) => (
                    <div key={course.id} className="flex gap-3 p-3 border rounded-lg">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={80}
                        height={45}
                        className="rounded object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{course.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-primary">
                            {formatPrice(course.price)}
                          </span>
                          {course.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(course.originalPrice)}
                            </span>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="mt-2 w-full">
                          添加到购物车
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 订单摘要 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>订单摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>商品小计 ({getTotalItems()} 件)</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>优惠券折扣</span>
                    <span className="text-green-600">-{formatPrice(0)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>总计</span>
                      <span className="text-lg text-primary">{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isLoading}
                  >
                    {isLoading ? "处理中..." : "立即结账"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/courses">继续购物</Link>
                  </Button>
                </div>

                <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>30天无理由退款</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>永久访问权限</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>支持移动端观看</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 优惠券 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">优惠券</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入优惠券代码"
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                  <Button size="sm" variant="outline">
                    应用
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  输入有效的优惠券代码可享受额外折扣
                </p>
              </CardContent>
            </Card>

            {/* 安全保障 */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium">安全支付保障</div>
                  <div className="flex justify-center gap-2 opacity-60">
                    <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-xs">
                      VISA
                    </div>
                    <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-xs">
                      MC
                    </div>
                    <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-xs">
                      支付宝
                    </div>
                    <div className="w-8 h-5 bg-muted rounded flex items-center justify-center text-xs">
                      微信
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    您的支付信息受到SSL加密保护
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
