import Stripe from 'stripe'

// 初始化Stripe客户端
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export interface CreatePaymentIntentParams {
  amount: number // 金额（分）
  currency: string
  orderId: string
  customerEmail?: string
  metadata?: Record<string, string>
}

export interface StripePaymentResult {
  clientSecret: string
  paymentIntentId: string
  publishableKey: string
}

/**
 * 创建Stripe支付意图
 */
export async function createStripePaymentIntent(
  params: CreatePaymentIntentParams
): Promise<StripePaymentResult> {
  try {
    const { amount, currency, orderId, customerEmail, metadata } = params

    // 检查是否为开发环境且使用示例密钥
    const isDevelopmentWithDemoKeys = process.env.STRIPE_SECRET_KEY === 'sk_test_51234567890abcdef'

    if (isDevelopmentWithDemoKeys) {
      // 返回模拟的成功响应用于开发测试
      console.log('Using mock Stripe response for development testing')
      return {
        clientSecret: `pi_mock_${Date.now()}_secret_mock`,
        paymentIntentId: `pi_mock_${Date.now()}`,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
      }
    }

    // 创建支付意图
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // 转换为分
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId,
        ...metadata,
      },
      receipt_email: customerEmail,
    })

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    }
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error)
    throw new Error('Failed to create payment intent')
  }
}

/**
 * 验证Stripe webhook签名
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Stripe webhook verification failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

/**
 * 获取支付意图详情
 */
export async function getStripePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error('Failed to retrieve payment intent:', error)
    throw new Error('Payment intent not found')
  }
}

/**
 * 创建退款
 */
export async function createStripeRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<Stripe.Refund> {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    }

    if (amount) {
      refundParams.amount = Math.round(amount * 100) // 转换为分
    }

    if (reason) {
      refundParams.reason = reason as Stripe.RefundCreateParams.Reason
    }

    return await stripe.refunds.create(refundParams)
  } catch (error) {
    console.error('Stripe refund creation failed:', error)
    throw new Error('Failed to create refund')
  }
}

/**
 * 获取支付方法
 */
export async function getStripePaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })
    return paymentMethods.data
  } catch (error) {
    console.error('Failed to retrieve payment methods:', error)
    throw new Error('Failed to retrieve payment methods')
  }
}

export { stripe }
