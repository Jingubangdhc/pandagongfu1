import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { calculateCommission } from '@/lib/utils'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // 这里应该验证webhook签名以确保请求来自支付提供商
    const { orderId, status, paymentMethod, transactionId } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 查找订单
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: {
          include: {
            referrer: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: '订单状态无效' },
        { status: 400 }
      )
    }

    // 更新订单状态
    if (status === 'completed') {
      await prisma.$transaction(async (tx) => {
        // 更新订单状态
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            transactionId
          }
        })

        // 创建购买记录
        const purchases = order.items.map(item => ({
          userId: order.userId,
          videoId: item.videoId,
          price: item.price,
          orderId: order.id
        }))

        await tx.purchase.createMany({
          data: purchases
        })

        // 处理推荐佣金
        if (order.user.referrer) {
          const commissions = await calculateCommission(
            order.totalAmount,
            order.user.referrer.id,
            tx
          )

          // 创建佣金记录
          for (const commission of commissions) {
            await tx.commission.create({
              data: {
                userId: commission.userId,
                fromUserId: order.userId,
                orderId: order.id,
                amount: commission.amount,
                level: commission.level,
                status: 'PENDING'
              }
            })
          }
        }
      })

      return NextResponse.json({
        message: '支付成功处理'
      })
    } else if (status === 'failed') {
      // 更新订单为失败状态
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'FAILED'
        }
      })

      return NextResponse.json({
        message: '支付失败处理'
      })
    }

    return NextResponse.json({
      message: '状态更新成功'
    })

  } catch (error) {
    console.error('Payment webhook error:', error)
    return NextResponse.json(
      { error: '处理支付回调失败' },
      { status: 500 }
    )
  }
}
