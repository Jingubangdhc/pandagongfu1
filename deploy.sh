#!/bin/bash

# Pandagongfu-慧 CloudBase 部署脚本
echo "🚀 开始部署 Pandagongfu-慧 到 CloudBase..."

# 检查必要的工具
echo "📋 检查部署环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查 CloudBase CLI
if ! command -v tcb &> /dev/null; then
    echo "📦 安装 CloudBase CLI..."
    npm install -g @cloudbase/cli
fi

# 检查环境变量文件
if [ ! -f ".env.production" ]; then
    echo "❌ 未找到 .env.production 文件"
    echo "请复制 .env.production.template 为 .env.production 并配置相应参数"
    exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 构建项目
echo "🔨 构建生产版本..."
cp next.config.prod.js next.config.js
npm run build

# 数据库迁移
echo "🗄️ 执行数据库迁移..."
npx prisma generate
npx prisma db push

# 登录 CloudBase (如果未登录)
echo "🔐 检查 CloudBase 登录状态..."
if ! tcb login --check; then
    echo "请先登录 CloudBase:"
    tcb login
fi

# 初始化 CloudBase 项目 (如果未初始化)
if [ ! -f "cloudbaserc.json" ]; then
    echo "🎯 初始化 CloudBase 项目..."
    tcb init
else
    echo "✅ CloudBase 项目已初始化"
fi

# 部署到 CloudBase
echo "🚀 部署到 CloudBase..."
tcb framework deploy

# 设置环境变量
echo "⚙️ 设置环境变量..."
tcb env:config set NODE_ENV production
tcb env:config set NEXT_PUBLIC_APP_URL $(grep NEXT_PUBLIC_APP_URL .env.production | cut -d '=' -f2)

# 部署完成
echo "✅ 部署完成！"
echo "🌐 访问地址: https://pandagongfu-hui-prod.tcloudbaseapp.com"
echo "📊 控制台: https://console.cloud.tencent.com/tcb"

# 清理临时文件
rm -f next.config.js

echo "🎉 部署成功！请访问上述地址查看您的应用。"
