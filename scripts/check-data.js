const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkData() {
  try {
    // 检查用户
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    })
    console.log('用户列表:', users)

    // 检查视频
    const videos = await prisma.video.findMany({
      select: { id: true, title: true }
    })
    console.log('视频列表:', videos)

    // 检查现有购买记录
    const purchases = await prisma.purchase.findMany({
      include: {
        user: { select: { email: true } },
        video: { select: { title: true } }
      }
    })
    console.log('购买记录:', purchases)

  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
