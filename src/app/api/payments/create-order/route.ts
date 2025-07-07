import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// 验证JWT token
function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: '无效的访问令牌' },
        { status: 401 }
      )
    }

    const { videoIds, paymentMethod, totalAmount } = await request.json()

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json(
        { error: '请选择要购买的视频' },
        { status: 400 }
      )
    }

    // 验证视频是否存在并计算总价
    const videos = await prisma.video.findMany({
      where: {
        id: { in: videoIds }
      }
    })

    if (videos.length !== videoIds.length) {
      return NextResponse.json(
        { error: '部分视频不存在' },
        { status: 400 }
      )
    }

    const calculatedTotal = videos.reduce((sum, video) => sum + video.price, 0)
    
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return NextResponse.json(
        { error: '订单金额不匹配' },
        { status: 400 }
      )
    }

    // 检查用户是否已购买这些视频
    const existingPurchases = await prisma.purchase.findMany({
      where: {
        userId: decoded.userId,
        videoId: { in: videoIds }
      }
    })

    if (existingPurchases.length > 0) {
      return NextResponse.json(
        { error: '您已购买过部分视频' },
        { status: 400 }
      )
    }

    // 创建订单
    const order = await prisma.order.create({
      data: {
        userId: decoded.userId,
        totalAmount: calculatedTotal,
        paymentMethod,
        status: 'PENDING',
        items: {
          create: videos.map(video => ({
            videoId: video.id,
            price: video.price,
            title: video.title
          }))
        }
      },
      include: {
        items: true
      }
    })

    // 根据支付方式返回不同的响应
    let paymentData = {}

    switch (paymentMethod) {
      case 'stripe':
        // 这里应该调用Stripe API创建支付意图
        paymentData = {
          clientSecret: 'mock_stripe_client_secret',
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        }
        break
      
      case 'alipay':
        // 这里应该调用支付宝API
        paymentData = {
          qrCode: 'mock_alipay_qr_code',
          payUrl: 'mock_alipay_url'
        }
        break
      
      case 'wechat':
        // 这里应该调用微信支付API
        paymentData = {
          qrCode: 'mock_wechat_qr_code',
          payUrl: 'mock_wechat_url'
        }
        break
    }

    return NextResponse.json({
      message: '订单创建成功',
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        items: order.items
      },
      payment: paymentData
    }, { status: 201 })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: '创建订单失败' },
      { status: 500 }
    )
  }
}
