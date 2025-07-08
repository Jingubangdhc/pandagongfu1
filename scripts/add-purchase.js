const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addPurchase() {
  try {
    // 创建购买记录
    const purchase = await prisma.purchase.create({
      data: {
        userId: 'cmctx9ob20005qhtrwnud0hwv', // user1@example.com 的用户ID
        videoId: 'cmctx9ob20007qhtrwnud0hwx', // 视频ID
        price: 99.99,
        status: 'COMPLETED'
      }
    })

    console.log('购买记录创建成功:', purchase)
  } catch (error) {
    console.error('创建购买记录失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addPurchase()
