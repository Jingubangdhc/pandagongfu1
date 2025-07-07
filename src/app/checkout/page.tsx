"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { CreditCard, Smartphone, QrCode, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useCart, useUser } from '@/components/providers'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

type PaymentMethod = 'card' | 'alipay' | 'wechat'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    billingAddress: '',
    city: '',
    postalCode: ''
  })

  // 检查是否是单个视频购买
  const singleVideoId = searchParams.get('video')
  const [singleVideo, setSingleVideo] = useState<any>(null)

  useEffect(() => {
    if (singleVideoId) {
      // 这里应该根据ID获取视频信息
      setSingleVideo({
        id: singleVideoId,
        title: '零基础学习太极拳入门课程',
        price: 99,
        thumbnail: '/api/placeholder/120/68'
      })
    }
  }, [singleVideoId])

  const orderItems = singleVideo ? [singleVideo] : items
  const totalPrice = singleVideo ? singleVideo.price : getTotalPrice()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "请先登录",
        description: "您需要登录后才能完成购买",
        variant: "destructive",
      })
      window.location.href = '/login'
      return
    }

    if (orderItems.length === 0) {
      toast({
        title: "没有商品",
        description: "请先添加商品到购物车",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // 模拟支付处理
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 清空购物车（如果不是单个视频购买）
      if (!singleVideo) {
        clearCart()
      }
      
      setOrderComplete(true)
      
      toast({
        title: "支付成功",
        description: "您的订单已完成，可以开始学习了！",
      })
    } catch (error) {
      toast({
        title: "支付失败",
        description: "支付过程中出现错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen">
        <Header />
        
        <div className="container py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2">支付成功！</h2>
              <p className="text-muted-foreground mb-6">
                您的订单已完成，现在可以开始学习了
              </p>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
                  查看我的课程
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                  返回首页
                </Button>
              </div>
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
          <h1 className="text-3xl font-bold mb-2">结账</h1>
          <p className="text-muted-foreground">
            完成您的购买，开始学习之旅
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 支付表单 */}
          <div className="space-y-6">
            {/* 支付方式选择 */}
            <Card>
              <CardHeader>
                <CardTitle>支付方式</CardTitle>
                <CardDescription>选择您偏好的支付方式</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">信用卡</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('alipay')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'alipay' ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <Smartphone className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">支付宝</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wechat')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      paymentMethod === 'wechat' ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <QrCode className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">微信支付</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 支付信息表单 */}
            <Card>
              <CardHeader>
                <CardTitle>支付信息</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium">
                      邮箱地址
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  {paymentMethod === 'card' && (
                    <>
                      <div>
                        <label htmlFor="cardNumber" className="text-sm font-medium">
                          卡号
                        </label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          type="text"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="text-sm font-medium">
                            有效期
                          </label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            type="text"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="text-sm font-medium">
                            CVV
                          </label>
                          <Input
                            id="cvv"
                            name="cvv"
                            type="text"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="cardName" className="text-sm font-medium">
                          持卡人姓名
                        </label>
                        <Input
                          id="cardName"
                          name="cardName"
                          type="text"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="张三"
                          required
                        />
                      </div>
                    </>
                  )}

                  {(paymentMethod === 'alipay' || paymentMethod === 'wechat') && (
                    <div className="text-center py-8">
                      <QrCode className="h-32 w-32 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫描二维码完成支付
                      </p>
                      <p className="text-lg font-semibold mt-2">
                        支付金额：{formatPrice(totalPrice)}
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isProcessing}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isProcessing ? "处理中..." : `支付 ${formatPrice(totalPrice)}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 订单摘要 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>订单摘要</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id || item.videoId} className="flex items-center gap-3">
                      <Image
                        src={item.thumbnail || '/api/placeholder/60/34'}
                        alt={item.title}
                        width={60}
                        height={34}
                        className="rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">数字课程</p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>小计</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>税费</span>
                      <span>{formatPrice(0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>总计</span>
                      <span className="text-primary">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>30天无理由退款保障</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>永久访问权限</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>支持移动端观看</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>SSL安全支付</span>
                  </div>
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
