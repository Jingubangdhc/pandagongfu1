import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { generateReferralCode } from '@/lib/utils'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, phone, referralCode } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '用户名、邮箱和密码不能为空' },
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
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: '该用户名已被使用' },
        { status: 400 }
      )
    }

    // 验证推荐码（如果提供）
    let referrerId = null
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode }
      })
      
      if (!referrer) {
        return NextResponse.json(
          { error: '推荐码无效' },
          { status: 400 }
        )
      }
      
      referrerId = referrer.id
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 生成用户的推荐码
    const userReferralCode = generateReferralCode()

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone: phone || null,
        referralCode: userReferralCode,
        referrerId
      }
    })

    // 如果有推荐人，创建推荐关系
    if (referrerId) {
      await prisma.referral.create({
        data: {
          referrerId,
          referredId: user.id
        }
      })
    }

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      referralCode: user.referralCode
    }

    return NextResponse.json({
      message: '注册成功',
      user: userResponse
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
