# 云存储配置指南

本文档详细说明如何配置AWS S3和阿里云OSS云存储服务。

## 概述

Pandagongfu-慧平台支持两种文件存储方式：
1. **本地存储** - 文件存储在服务器本地 `public/uploads/` 目录
2. **云存储** - 文件存储在AWS S3或阿里云OSS

## 配置步骤

### 1. 基础配置

在 `.env.local` 文件中设置以下环境变量：

```bash
# 启用云存储 (true=云存储, false=本地存储)
USE_CLOUD_STORAGE=true

# 选择云存储提供商 ("aws" 或 "alibaba")
CLOUD_STORAGE_PROVIDER="aws"
```

### 2. AWS S3 配置

#### 2.1 创建AWS账户和S3存储桶

1. 访问 [AWS控制台](https://aws.amazon.com/console/)
2. 创建新的S3存储桶
3. 设置存储桶权限（建议私有存储桶）
4. 创建IAM用户并获取访问密钥

#### 2.2 配置环境变量

```bash
# AWS S3 配置
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
AWS_S3_ENDPOINT=""  # 留空使用默认AWS端点
```

#### 2.3 IAM权限配置

为IAM用户分配以下权限策略：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

### 3. 阿里云OSS配置

#### 3.1 创建阿里云账户和OSS存储桶

1. 访问 [阿里云控制台](https://oss.console.aliyun.com/)
2. 创建新的OSS存储桶
3. 选择合适的地域
4. 创建RAM用户并获取AccessKey

#### 3.2 配置环境变量

```bash
# 阿里云OSS配置
ALIBABA_ACCESS_KEY_ID="LTAI..."
ALIBABA_ACCESS_KEY_SECRET="your-secret-key"
ALIBABA_OSS_REGION="oss-cn-hangzhou"
ALIBABA_OSS_BUCKET="your-bucket-name"
ALIBABA_OSS_ENDPOINT="https://oss-cn-hangzhou.aliyuncs.com"
```

#### 3.3 RAM权限配置

为RAM用户分配以下权限：

```json
{
    "Version": "1",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "oss:PutObject",
                "oss:GetObject",
                "oss:DeleteObject",
                "oss:ListObjects"
            ],
            "Resource": [
                "acs:oss:*:*:your-bucket-name",
                "acs:oss:*:*:your-bucket-name/*"
            ]
        }
    ]
}
```

## 文件上传限制配置

```bash
# 文件大小限制
MAX_VIDEO_SIZE_MB=500  # 视频文件最大500MB
MAX_IMAGE_SIZE_MB=10   # 图片文件最大10MB
```

## 支持的文件格式

### 视频格式
- MP4 (video/mp4)
- AVI (video/avi)
- MOV (video/mov)
- WMV (video/wmv)
- FLV (video/flv)
- WebM (video/webm)

### 图片格式
- JPEG (image/jpeg)
- JPG (image/jpg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)

## 故障排除

### 常见问题

1. **上传失败 - 权限错误**
   - 检查AccessKey是否正确
   - 确认IAM/RAM用户权限配置
   - 验证存储桶名称和地域设置

2. **文件无法访问**
   - 检查存储桶权限设置
   - 确认文件URL生成是否正确
   - 验证CDN配置（如果使用）

3. **上传速度慢**
   - 选择距离用户更近的地域
   - 考虑使用CDN加速
   - 检查网络连接质量

### 测试配置

使用以下命令测试云存储配置：

```bash
# 测试图片上传
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer your-admin-token" \
  -F "file=@test.jpg" \
  -F "type=image"

# 测试视频上传
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer your-admin-token" \
  -F "file=@test.mp4" \
  -F "type=video"
```

## 安全建议

1. **密钥安全**
   - 不要在代码中硬编码密钥
   - 使用环境变量存储敏感信息
   - 定期轮换访问密钥

2. **存储桶安全**
   - 设置适当的访问权限
   - 启用访问日志记录
   - 考虑启用版本控制

3. **网络安全**
   - 使用HTTPS传输
   - 配置CORS策略
   - 实施访问频率限制

## 成本优化

1. **存储类别选择**
   - 频繁访问：标准存储
   - 不频繁访问：低频存储
   - 归档数据：归档存储

2. **生命周期管理**
   - 设置自动删除规则
   - 配置存储类别转换
   - 清理未完成的分片上传

3. **流量优化**
   - 使用CDN减少直接访问
   - 压缩文件减少传输量
   - 合理设置缓存策略
