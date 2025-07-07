# 视频学习平台

一个功能完整的在线视频学习平台，支持付费课程、多级分佣系统和多种支付方式。

## 功能特性

### 核心功能
- 🎥 **视频课程管理** - 支持视频上传、分类、章节管理
- 💰 **多种支付方式** - 支持信用卡、支付宝、微信支付
- 👥 **多级分佣系统** - 二级分销，一级15%，二级5%佣金
- 🛒 **购物车系统** - 支持批量购买和优惠券
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🔐 **用户认证** - JWT认证，角色权限管理

### 用户功能
- 用户注册/登录
- 课程浏览和搜索
- 视频播放和学习进度跟踪
- 购物车和订单管理
- 个人中心和收益管理
- 推广链接生成和分享

### 管理功能
- 视频内容管理
- 用户管理
- 订单和支付管理
- 佣金结算管理
- 数据统计和分析

## 技术栈

### 前端
- **Next.js 14** - React全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Radix UI** - 无障碍组件库
- **Lucide React** - 图标库

### 后端
- **Next.js API Routes** - 服务端API
- **Prisma** - 数据库ORM
- **PostgreSQL** - 主数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

### 支付集成
- **Stripe** - 国际信用卡支付
- **支付宝** - 国内移动支付
- **微信支付** - 国内移动支付

### 部署和存储
- **Vercel** - 应用部署
- **AWS S3** - 文件存储
- **阿里云OSS** - 国内文件存储

## 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- PostgreSQL 数据库
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd video-learning-platform
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置以下必要参数：
- `DATABASE_URL` - PostgreSQL数据库连接字符串
- `JWT_SECRET` - JWT密钥
- `NEXT_PUBLIC_BASE_URL` - 网站基础URL

4. **初始化数据库**
```bash
npx prisma generate
npx prisma db push
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API路由
│   ├── (auth)/            # 认证相关页面
│   ├── courses/           # 课程列表页面
│   ├── video/[id]/        # 视频详情页面
│   ├── dashboard/         # 用户中心
│   ├── cart/              # 购物车
│   └── checkout/          # 结账页面
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   ├── layout/           # 布局组件
│   └── video/            # 视频相关组件
├── lib/                  # 工具函数和配置
├── hooks/                # 自定义React Hooks
└── types/                # TypeScript类型定义

prisma/
├── schema.prisma         # 数据库模型定义
└── migrations/           # 数据库迁移文件
```

## 数据库设计

### 主要数据表
- **User** - 用户信息和推荐关系
- **Video** - 视频课程信息
- **Category** - 课程分类
- **Purchase** - 购买记录
- **Order** - 订单信息
- **Commission** - 佣金记录
- **Withdrawal** - 提现记录

### 分佣系统设计
- 二级分销结构
- 一级推荐人获得15%佣金
- 二级推荐人获得5%佣金
- 支持佣金结算和提现

## API文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出

### 视频接口
- `GET /api/videos` - 获取视频列表
- `GET /api/videos/[id]` - 获取视频详情
- `POST /api/videos` - 创建视频（管理员）

### 支付接口
- `POST /api/payments/create-order` - 创建订单
- `POST /api/payments/webhook` - 支付回调

## 部署指南

### Vercel部署
1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 部署应用

### 数据库部署
推荐使用以下服务：
- **Supabase** - PostgreSQL托管服务
- **PlanetScale** - MySQL托管服务
- **Railway** - 全栈应用托管

### 文件存储
配置云存储服务：
- **AWS S3** - 国际用户
- **阿里云OSS** - 国内用户

## 开发指南

### 添加新功能
1. 更新数据库模型（如需要）
2. 创建API路由
3. 实现前端组件
4. 添加类型定义
5. 编写测试

### 代码规范
- 使用TypeScript进行类型检查
- 遵循ESLint和Prettier配置
- 组件使用函数式写法
- API使用RESTful设计

## 许可证

MIT License

## 支持

如有问题或建议，请提交Issue或联系开发团队。

---

**注意**: 这是一个演示项目，生产环境使用前请确保：
1. 更换所有默认密钥和配置
2. 配置正确的支付接口
3. 设置适当的安全策略
4. 进行充分的测试
