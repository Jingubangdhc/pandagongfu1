import {
  createStripePaymentIntent,
  StripePaymentResult,
  CreatePaymentIntentParams
} from './stripe'
// import {
//   createAlipayQROrder,
//   createAlipayWapOrder,
//   AlipayPaymentResult,
//   CreateAlipayOrderParams
// } from './alipay'
// import {
//   createWechatQROrder,
//   createWechatH5Order,
//   WechatPaymentResult,
//   CreateWechatOrderParams
// } from './wechat'

export type PaymentMethod = 'stripe' | 'alipay' | 'wechat'

export interface CreatePaymentParams {
  orderId: string
  amount: number
  description: string
  paymentMethod: PaymentMethod
  customerEmail?: string
  userAgent?: string
  clientIp?: string
  notifyUrl?: string
  returnUrl?: string
}

export interface PaymentResult {
  paymentMethod: PaymentMethod
  orderId: string
  data: StripePaymentResult | string
}

/**
 * 统一支付创建接口
 */
export async function createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { paymentMethod, orderId, amount, description, customerEmail, userAgent, clientIp, notifyUrl, returnUrl } = params

  try {
    switch (paymentMethod) {
      case 'stripe': {
        const stripeParams: CreatePaymentIntentParams = {
          amount,
          currency: 'USD',
          orderId,
          customerEmail,
          metadata: {
            description,
          },
        }
        
        const result = await createStripePaymentIntent(stripeParams)
        return {
          paymentMethod: 'stripe',
          orderId,
          data: result,
        }
      }

      case 'alipay': {
        throw new Error('Alipay payment is temporarily disabled')
      }

      case 'wechat': {
        throw new Error('WeChat Pay is temporarily disabled')
      }

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`)
    }
  } catch (error) {
    console.error(`Payment creation failed for ${paymentMethod}:`, error)
    throw new Error(`Failed to create ${paymentMethod} payment`)
  }
}

/**
 * 获取支付方法的显示信息
 */
export function getPaymentMethodInfo(method: PaymentMethod) {
  const paymentMethods = {
    stripe: {
      name: 'Credit Card',
      displayName: '信用卡支付',
      icon: '💳',
      description: 'Secure payment with Visa, Mastercard, etc.',
      currencies: ['USD', 'EUR', 'GBP'],
    },
    alipay: {
      name: 'Alipay',
      displayName: '支付宝',
      icon: '🅰️',
      description: 'Pay with Alipay account',
      currencies: ['CNY'],
    },
    wechat: {
      name: 'WeChat Pay',
      displayName: '微信支付',
      icon: '💬',
      description: 'Pay with WeChat account',
      currencies: ['CNY'],
    },
  }

  return paymentMethods[method]
}

/**
 * 获取支持的支付方法列表
 */
export function getSupportedPaymentMethods(): PaymentMethod[] {
  const methods: PaymentMethod[] = []

  // 检查Stripe配置
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY) {
    methods.push('stripe')
  }

  // 检查支付宝配置 (暂时禁用)
  // if (process.env.ALIPAY_APP_ID && process.env.ALIPAY_PRIVATE_KEY) {
  //   methods.push('alipay')
  // }

  // 检查微信支付配置 (暂时禁用)
  // if (process.env.WECHAT_APP_ID && process.env.WECHAT_MCH_ID) {
  //   methods.push('wechat')
  // }

  return methods
}

/**
 * 验证支付方法是否可用
 */
export function isPaymentMethodAvailable(method: PaymentMethod): boolean {
  return getSupportedPaymentMethods().includes(method)
}

// 导出所有支付相关的类型和函数
export * from './stripe'
// export * from './alipay'  // 暂时禁用，等待修复
// export * from './wechat'  // 暂时禁用，等待修复
