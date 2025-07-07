# 部署指南

本文档详细说明如何将视频学习平台部署到生产环境。

## 前置要求

### 必需服务
1. **数据库**: PostgreSQL 12+ 或 MySQL 8+
2. **Node.js**: 18.0+ 版本
3. **域名**: 用于生产环境访问
4. **SSL证书**: HTTPS访问（推荐使用Let's Encrypt）

### 推荐服务
1. **CDN**: 用于静态资源加速
2. **文件存储**: AWS S3 或阿里云OSS
3. **邮件服务**: 用于发送通知邮件
4. **监控服务**: 用于应用性能监控

## 部署选项

### 选项1: Vercel部署（推荐）

Vercel是最简单的部署方式，特别适合Next.js应用。

#### 步骤1: 准备代码仓库
```bash
# 确保代码已推送到GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 步骤2: 连接Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击"New Project"
4. 选择你的仓库
5. 配置项目设置

#### 步骤3: 配置环境变量
在Vercel项目设置中添加以下环境变量：

```bash
# 数据库
DATABASE_URL=postgresql://username:password@host:5432/database

# JWT密钥
JWT_SECRET=your-super-secret-jwt-key-here

# 网站URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# 支付配置
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 其他配置...
```

#### 步骤4: 部署
1. 点击"Deploy"
2. 等待构建完成
3. 访问分配的域名测试

### 选项2: 自托管部署

#### 步骤1: 服务器准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2（进程管理器）
sudo npm install -g pm2

# 安装Nginx
sudo apt install nginx -y
```

#### 步骤2: 数据库设置
```bash
# 安装PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 创建数据库和用户
sudo -u postgres psql
CREATE DATABASE video_platform;
CREATE USER platform_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE video_platform TO platform_user;
\q
```

#### 步骤3: 应用部署
```bash
# 克隆代码
git clone <your-repo-url>
cd video-learning-platform

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件

# 构建应用
npm run build

# 初始化数据库
npm run db:generate
npm run db:push
npm run db:seed

# 启动应用
pm2 start npm --name "video-platform" -- start
pm2 save
pm2 startup
```

#### 步骤4: Nginx配置
```nginx
# /etc/nginx/sites-available/video-platform
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/video-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 步骤5: SSL证书
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 数据库配置

### PostgreSQL (推荐)
```bash
# 连接字符串格式
DATABASE_URL="postgresql://username:password@localhost:5432/video_platform"
```

### MySQL
```bash
# 连接字符串格式
DATABASE_URL="mysql://username:password@localhost:3306/video_platform"
```

### 云数据库推荐
- **Supabase**: 免费PostgreSQL托管
- **PlanetScale**: MySQL托管服务
- **Railway**: 全栈应用托管
- **AWS RDS**: 企业级数据库服务

## 支付配置

### Stripe配置
1. 注册Stripe账号
2. 获取API密钥
3. 配置Webhook端点: `https://yourdomain.com/api/payments/webhook`
4. 设置环境变量

### 支付宝配置
1. 申请支付宝开发者账号
2. 创建应用获取APP_ID
3. 配置公私钥
4. 设置回调地址

### 微信支付配置
1. 申请微信商户号
2. 获取API密钥
3. 配置支付回调
4. 设置环境变量

## 文件存储配置

### AWS S3
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### 阿里云OSS
```bash
ALIYUN_ACCESS_KEY_ID=your_access_key
ALIYUN_ACCESS_KEY_SECRET=your_secret_key
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_BUCKET=your-bucket-name
```

## 监控和日志

### PM2监控
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs video-platform

# 重启应用
pm2 restart video-platform

# 监控面板
pm2 monit
```

### 日志配置
```bash
# 配置日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 安全配置

### 防火墙设置
```bash
# 配置UFW防火墙
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 安全头配置
在Nginx配置中添加安全头：
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 性能优化

### 缓存配置
```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_videos_category ON videos(category_id);
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

## 备份策略

### 数据库备份
```bash
# 创建备份脚本
#!/bin/bash
BACKUP_DIR="/var/backups/video-platform"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump video_platform > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### 文件备份
```bash
# 备份上传文件
rsync -av /path/to/uploads/ /backup/location/
```

## 故障排除

### 常见问题
1. **数据库连接失败**: 检查DATABASE_URL和网络连接
2. **支付回调失败**: 验证Webhook URL和签名
3. **文件上传失败**: 检查存储配置和权限
4. **邮件发送失败**: 验证SMTP配置

### 日志查看
```bash
# 应用日志
pm2 logs video-platform

# Nginx日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 系统日志
sudo journalctl -u nginx -f
```

## 维护建议

1. **定期更新**: 保持依赖包和系统更新
2. **监控性能**: 使用APM工具监控应用性能
3. **备份验证**: 定期测试备份恢复
4. **安全扫描**: 定期进行安全漏洞扫描
5. **容量规划**: 监控存储和带宽使用情况

---

如有部署问题，请参考项目文档或联系技术支持。
