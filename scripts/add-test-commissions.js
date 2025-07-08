const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestCommissions() {
  try {
    // 获取所有用户
    const users = await prisma.user.findMany()
    console.log('All users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })))

    // 重置管理员密码
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('password123', 12)

    const adminUser = await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { password: hashedPassword }
    })

    console.log('Admin password updated for:', adminUser.email)

    // 获取测试用户
    const user = await prisma.user.findFirst()

    if (!user) {
      console.log('No users found')
      return
    }

    console.log('Found user:', user.id, user.email)

    // 获取第二个用户作为fromUser
    const fromUser = users[1] || users[0]

    // 检查是否已有佣金记录
    const existingCommissions = await prisma.commission.findMany({
      where: { userId: user.id }
    })

    if (existingCommissions.length === 0) {
      // 添加一些测试佣金记录
      const commissions = await prisma.commission.createMany({
        data: [
          {
            userId: user.id,
            fromUserId: fromUser.id,
            amount: 100.00,
            level: 1,
            status: 'CONFIRMED'
          },
          {
            userId: user.id,
            fromUserId: fromUser.id,
            amount: 50.00,
            level: 1,
            status: 'CONFIRMED'
          },
          {
            userId: user.id,
            fromUserId: fromUser.id,
            amount: 25.00,
            level: 2,
            status: 'CONFIRMED'
          }
        ]
      })

      console.log('Created commissions:', commissions.count)
    } else {
      console.log('Commissions already exist:', existingCommissions.length)
    }

    // 查询用户的总佣金
    const totalCommissions = await prisma.commission.aggregate({
      where: {
        userId: user.id,
        status: 'CONFIRMED'
      },
      _sum: {
        amount: true
      }
    })

    console.log('Total confirmed commissions:', totalCommissions._sum.amount)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestCommissions()
