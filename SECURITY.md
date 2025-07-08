# 🔒 安全配置指南

本文档描述了 Pandagongfu-慧 视频学习平台的安全配置和最佳实践。

## 🚨 关键安全要求

### 1. JWT 密钥配置

**⚠️ 重要：生产环境必须设置强JWT密钥**

```bash
# 生成安全的JWT密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 设置环境变量
JWT_SECRET="your-generated-secure-key-here"
```

**要求：**
- 至少32字符长度
- 包含大小写字母、数字和特殊字符
- 绝不使用默认值
- 定期轮换（建议每6个月）

### 2. HTTPS 配置

**生产环境必须使用HTTPS：**

```bash
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

**配置要求：**
- 使用有效的SSL证书
- 启用HSTS头部
- 重定向所有HTTP流量到HTTPS

### 3. 数据库安全

**生产环境数据库连接：**

```bash
# PostgreSQL with SSL
DATABASE_URL="postgresql://user:password@host:5432/database?ssl=true&sslmode=require"
```

**要求：**
- 启用SSL连接
- 使用强密码
- 限制数据库访问IP
- 定期备份

## 🛡️ 已实施的安全功能

### 1. 速率限制

- **认证API**: 15分钟内最多5次请求
- **文件上传**: 1小时内最多50次请求
- **一般API**: 15分钟内最多100次请求
- **页面访问**: 15分钟内最多1000次请求

### 2. 安全头部

自动设置以下安全头部：

```
Content-Security-Policy: 严格的CSP策略
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: HSTS (生产环境)
```

### 3. 文件上传安全

- **类型验证**: 严格的MIME类型和扩展名检查
- **大小限制**: 视频500MB，图片10MB
- **内容扫描**: 防止恶意文件上传
- **路径安全**: 防止目录遍历攻击

### 4. 输入验证

- **XSS防护**: 自动清理用户输入
- **SQL注入防护**: 使用参数化查询
- **CSRF保护**: 令牌验证机制

## 🔧 安全配置选项

### 环境变量配置

```bash
# 启用/禁用安全功能
ENABLE_RATE_LIMITING="true"
ENABLE_SECURITY_HEADERS="true"
ENABLE_CSRF_PROTECTION="true"

# 日志配置
LOG_LEVEL="info"
ENABLE_ACCESS_LOGS="true"

# 会话配置
SESSION_TIMEOUT="7d"
REFRESH_TOKEN_TIMEOUT="30d"
```

### 支付安全

```bash
# Stripe配置
STRIPE_PUBLIC_KEY="pk_live_..."  # 生产环境使用live密钥
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**要求：**
- 使用Stripe的live密钥（生产环境）
- 配置Webhook端点验证
- 启用3D Secure验证

## 🚨 安全检查清单

### 部署前检查

- [ ] JWT_SECRET 已设置为强密钥
- [ ] 数据库连接使用SSL
- [ ] HTTPS 已启用
- [ ] 支付网关配置正确
- [ ] 邮件服务配置安全
- [ ] 云存储访问权限正确
- [ ] 环境变量不包含敏感信息
- [ ] 日志记录已配置
- [ ] 备份策略已实施

### 运行时监控

- [ ] 监控异常登录尝试
- [ ] 跟踪API使用模式
- [ ] 监控文件上传活动
- [ ] 检查错误日志
- [ ] 验证支付交易
- [ ] 监控系统资源使用

## 🔍 安全测试

### 自动安全检查

应用启动时会自动执行安全检查：

```bash
npm run dev  # 开发环境检查
npm run build && npm start  # 生产环境检查
```

### 手动安全测试

```bash
# 测试速率限制
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  --repeat 10

# 测试文件上传限制
curl -X POST http://localhost:3000/api/upload \
  -F "file=@large-file.mp4" \
  -F "type=video"

# 测试安全头部
curl -I http://localhost:3000/
```

## 🚨 安全事件响应

### 发现安全问题时

1. **立即行动**：
   - 评估影响范围
   - 隔离受影响系统
   - 收集证据

2. **通知相关方**：
   - 通知系统管理员
   - 如涉及用户数据，通知用户
   - 必要时联系执法部门

3. **修复和恢复**：
   - 修复安全漏洞
   - 恢复系统正常运行
   - 加强监控

4. **事后分析**：
   - 分析根本原因
   - 更新安全策略
   - 改进防护措施

## 📞 安全联系方式

如发现安全漏洞，请通过以下方式报告：

- **邮箱**: security@pandagongfu.com
- **加密通信**: 使用PGP密钥
- **紧急情况**: 24小时内响应

## 📚 相关资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Stripe Security](https://stripe.com/docs/security)

---

**最后更新**: 2024年12月
**版本**: 1.0
**维护者**: Pandagongfu-慧 开发团队
