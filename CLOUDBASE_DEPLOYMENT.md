# Pandagongfu-慧 CloudBase 部署指南

## 📋 部署前准备

### 1. 腾讯云账号准备
- 注册腾讯云账号：https://cloud.tencent.com/
- 开通CloudBase服务：https://console.cloud.tencent.com/tcb
- 创建新的环境，建议环境ID：`pandagongfu-hui-prod`

### 2. 数据库准备
- 在CloudBase控制台创建MySQL数据库实例
- 记录数据库连接信息：主机地址、端口、用户名、密码

### 3. 支付网关准备

#### Stripe（推荐，已集成）
- 注册Stripe账号：https://stripe.com/
- 获取生产环境API密钥：
  - Publishable Key (pk_live_...)
  - Secret Key (sk_live_...)
  - Webhook Secret (whsec_...)

#### 微信支付（可选）
- 申请微信商户号：https://pay.weixin.qq.com/
- 获取API密钥和证书文件
- 配置支付回调域名

#### 支付宝（可选）
- 申请支付宝商户号：https://open.alipay.com/
- 生成RSA密钥对
- 配置应用公钥

## 🚀 部署步骤

### 第一步：环境配置

1. **复制环境变量模板**
```bash
cp .env.production.template .env.production
```

2. **配置环境变量**
编辑 `.env.production` 文件，填入真实的配置值：

```env
# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# 数据库配置
DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"

# JWT配置
JWT_SECRET=your-super-secure-jwt-secret-key-for-production

# Stripe配置（必需）
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# 其他配置...
```

### 第二步：登录CloudBase

```bash
# 登录CloudBase
tcb login

# 验证登录状态
tcb login --check
```

### 第三步：初始化项目

```bash
# 初始化CloudBase项目
tcb init

# 或者使用现有配置
# cloudbaserc.json 文件已经准备好
```

### 第四步：数据库迁移

```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库结构到生产环境
npx prisma db push

# 创建初始数据
node scripts/migrate-to-production.js init

# 如果需要迁移开发环境数据
node scripts/migrate-to-production.js migrate
```

### 第五步：构建项目

```bash
# 安装依赖
npm install

# 构建生产版本
cp next.config.prod.js next.config.js
npm run build
```

### 第六步：部署到CloudBase

```bash
# 使用部署脚本（推荐）
chmod +x deploy.sh
./deploy.sh

# 或者手动部署
tcb framework deploy
```

### 第七步：配置环境变量

在CloudBase控制台设置环境变量，或使用CLI：

```bash
# 设置基础环境变量
tcb env:config set NODE_ENV production
tcb env:config set JWT_SECRET your-jwt-secret
tcb env:config set DATABASE_URL "your-database-url"

# 设置支付配置
tcb env:config set STRIPE_PUBLISHABLE_KEY pk_live_xxx
tcb env:config set STRIPE_SECRET_KEY sk_live_xxx
tcb env:config set STRIPE_WEBHOOK_SECRET whsec_xxx
```

## 🔧 配置域名和SSL

### 1. 绑定自定义域名
- 在CloudBase控制台 -> 静态网站托管 -> 设置
- 添加自定义域名
- 配置DNS解析（CNAME记录指向CloudBase域名）

### 2. 配置SSL证书
- CloudBase自动提供免费SSL证书
- 或上传自己的SSL证书

### 3. 配置CDN加速
- 开启CDN加速
- 配置缓存策略
- 设置回源规则

## 📊 监控和维护

### 1. 日志监控
- CloudBase控制台 -> 云函数 -> 日志
- 查看应用运行日志和错误信息

### 2. 性能监控
- 监控API响应时间
- 数据库连接状态
- 内存和CPU使用情况

### 3. 数据备份
```bash
# 定期备份数据库
mysqldump -h host -u username -p database > backup.sql

# 或使用CloudBase数据库备份功能
```

## 🔒 安全配置

### 1. 环境变量安全
- 所有敏感信息使用环境变量
- 定期更换JWT密钥
- 使用强密码策略

### 2. 网络安全
- 配置防火墙规则
- 启用DDoS防护
- 设置访问频率限制

### 3. 数据安全
- 启用数据库SSL连接
- 定期更新依赖包
- 监控安全漏洞

## 🚨 故障排除

### 常见问题

1. **部署失败**
   - 检查环境变量配置
   - 验证数据库连接
   - 查看构建日志

2. **数据库连接失败**
   - 检查DATABASE_URL格式
   - 验证数据库权限
   - 确认网络连通性

3. **支付功能异常**
   - 验证支付网关配置
   - 检查webhook URL
   - 查看支付日志

### 调试命令

```bash
# 查看部署状态
tcb framework list

# 查看环境变量
tcb env:config list

# 查看函数日志
tcb functions:log function-name

# 测试数据库连接
npx prisma db pull
```

## 📞 技术支持

如果遇到部署问题，请检查：
1. CloudBase官方文档：https://docs.cloudbase.net/
2. 项目GitHub Issues
3. 腾讯云技术支持

---

**部署完成后访问地址：**
- 默认域名：https://pandagongfu-hui-prod.tcloudbaseapp.com
- 自定义域名：https://your-domain.com
- 管理后台：https://your-domain.com/dashboard
