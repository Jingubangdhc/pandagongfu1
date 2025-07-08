import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // 验证输入
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '姓名、邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    // 生成用户名（基于邮箱前缀和随机数）
    const emailPrefix = email.split('@')[0]
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    const username = `${emailPrefix}_${randomSuffix}`

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 生成推荐码
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        referralCode
      }
    })

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: '注册成功',
      token,
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
