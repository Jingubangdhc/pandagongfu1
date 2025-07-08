/**
 * 生产环境支付网关配置
 */

const paymentConfig = {
  // Stripe 生产环境配置
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: 'usd',
    enabled: true,
    // 生产环境配置
    apiVersion: '2023-10-16',
    maxNetworkRetries: 3,
    timeout: 30000,
    telemetry: false
  },

  // 微信支付生产环境配置
  wechatPay: {
    appId: process.env.WECHAT_PAY_APP_ID,
    mchId: process.env.WECHAT_PAY_MCH_ID,
    apiKey: process.env.WECHAT_PAY_API_KEY,
    certPath: process.env.WECHAT_PAY_CERT_PATH,
    keyPath: process.env.WECHAT_PAY_KEY_PATH,
    notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/wechat/notify`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    enabled: false, // 暂时禁用，需要配置证书
    // 生产环境配置
    sandbox: false,
    timeout: 30000
  },

  // 支付宝生产环境配置
  alipay: {
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    publicKey: process.env.ALIPAY_PUBLIC_KEY,
    notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/alipay/notify`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    enabled: false, // 暂时禁用，需要配置密钥
    // 生产环境配置
    sandbox: false,
    timeout: 30000,
    charset: 'utf-8',
    signType: 'RSA2'
  },

  // 通用配置
  common: {
    // 支付超时时间（分钟）
    timeout: 30,
    // 支付成功回调URL
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    // 支付失败回调URL
    failureUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
    // 支付取消回调URL
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
    // 默认货币
    defaultCurrency: 'USD',
    // 支持的货币列表
    supportedCurrencies: ['USD', 'CNY'],
    // 最小支付金额（分）
    minAmount: 100,
    // 最大支付金额（分）
    maxAmount: 10000000
  },

  // 佣金配置
  commission: {
    // 默认佣金比例
    defaultRate: 0.1, // 10%
    // 佣金层级配置
    levels: [
      { level: 1, rate: 0.1 }, // 一级佣金 10%
      { level: 2, rate: 0.05 }, // 二级佣金 5%
      { level: 3, rate: 0.02 }  // 三级佣金 2%
    ],
    // 提现配置
    withdrawal: {
      // 最小提现金额
      minAmount: 10,
      // 提现手续费比例
      feeRate: 0.02, // 2%
      // 提现处理时间（工作日）
      processingDays: 3
    }
  }
};

// 验证配置
function validateConfig() {
  const errors = [];

  // 验证Stripe配置
  if (paymentConfig.stripe.enabled) {
    if (!paymentConfig.stripe.publishableKey) {
      errors.push('Stripe publishable key is required');
    }
    if (!paymentConfig.stripe.secretKey) {
      errors.push('Stripe secret key is required');
    }
    if (!paymentConfig.stripe.webhookSecret) {
      errors.push('Stripe webhook secret is required');
    }
  }

  // 验证微信支付配置
  if (paymentConfig.wechatPay.enabled) {
    if (!paymentConfig.wechatPay.appId) {
      errors.push('WeChat Pay app ID is required');
    }
    if (!paymentConfig.wechatPay.mchId) {
      errors.push('WeChat Pay merchant ID is required');
    }
    if (!paymentConfig.wechatPay.apiKey) {
      errors.push('WeChat Pay API key is required');
    }
  }

  // 验证支付宝配置
  if (paymentConfig.alipay.enabled) {
    if (!paymentConfig.alipay.appId) {
      errors.push('Alipay app ID is required');
    }
    if (!paymentConfig.alipay.privateKey) {
      errors.push('Alipay private key is required');
    }
    if (!paymentConfig.alipay.publicKey) {
      errors.push('Alipay public key is required');
    }
  }

  if (errors.length > 0) {
    console.warn('Payment configuration warnings:', errors);
  }

  return errors.length === 0;
}

// 获取启用的支付方式
function getEnabledPaymentMethods() {
  const methods = [];
  
  if (paymentConfig.stripe.enabled) {
    methods.push('stripe');
  }
  
  if (paymentConfig.wechatPay.enabled) {
    methods.push('wechat');
  }
  
  if (paymentConfig.alipay.enabled) {
    methods.push('alipay');
  }

  return methods;
}

module.exports = {
  paymentConfig,
  validateConfig,
  getEnabledPaymentMethods
};
