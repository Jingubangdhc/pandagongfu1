import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: '太极拳法' },
      update: {},
      create: {
        name: '太极拳法',
        description: '传统太极拳法，阴阳调和，刚柔并济',
        slug: 'taiji-quan'
      }
    }),
    prisma.category.upsert({
      where: { name: '内功心法' },
      update: {},
      create: {
        name: '内功心法',
        description: '武当内家功法，修炼丹田真气',
        slug: 'internal-arts'
      }
    }),
    prisma.category.upsert({
      where: { name: '养生功法' },
      update: {},
      create: {
        name: '养生功法',
        description: '八段锦、五禽戏等传统养生功法',
        slug: 'health-qigong'
      }
    }),
    prisma.category.upsert({
      where: { name: '武当秘传' },
      update: {},
      create: {
        name: '武当秘传',
        description: '武当山传承的古法秘籍',
        slug: 'wudang-secrets'
      }
    })
  ])

  console.log('分类创建完成:', categories.length)

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'Pandagongfu-慧 掌门',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      referralCode: 'ADMIN001',
      avatar: '/api/placeholder/100/100'
    }
  })

  console.log('管理员用户创建完成:', admin.username)

  // 创建测试用户
  const userPassword = await bcrypt.hash('user123', 12)
  const testUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user1@example.com' },
      update: {},
      create: {
        username: '张三',
        email: 'user1@example.com',
        password: userPassword,
        role: 'USER',
        referralCode: 'USER001',
        avatar: '/api/placeholder/100/100'
      }
    }),
    prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        username: '李四',
        email: 'user2@example.com',
        password: userPassword,
        role: 'USER',
        referralCode: 'USER002',
        avatar: '/api/placeholder/100/100',
        referrerId: admin.id // 设置推荐人为管理员
      }
    })
  ])

  console.log('测试用户创建完成:', testUsers.length)

  // 创建示例视频
  const videos = await Promise.all([
    prisma.video.upsert({
      where: { id: 'video-1' },
      update: {},
      create: {
        id: 'video-1',
        title: '太极拳入门心法 - 阴阳调和之道',
        description: '从太极哲学入手，领悟阴阳调和的奥秘，掌握太极拳的核心精神与基础功法。课程涵盖：太极理论精髓、基础桩功、阴阳转换要领、入门套路演练等传统精华。',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video1.mp4',
        price: 99,
        originalPrice: 199,
        duration: 3600, // 60分钟
        instructor: '李玄德师父',
        categoryId: categories[0].id,
        tags: '["入门", "基础", "24式"]',
        difficulty: 'BEGINNER',
        rating: 4.8
      }
    }),
    prisma.video.upsert({
      where: { id: 'video-2' },
      update: {},
      create: {
        id: 'video-2',
        title: '武当内家功法 - 丹田修炼秘传',
        description: '传承武当山千年内功心法，修炼丹田真气，强身健体，延年益寿。深入讲解：丹田运气法门、内息调理、真气运行路径、内功筑基要诀等武当秘传。',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video2.mp4',
        price: 199,
        originalPrice: 299,
        duration: 5400, // 90分钟
        instructor: '王清虚道长',
        categoryId: categories[1].id,
        tags: '["进阶", "推手", "内功"]',
        difficulty: 'ADVANCED',
        rating: 4.9
      }
    }),
    prisma.video.upsert({
      where: { id: 'video-3' },
      update: {},
      create: {
        id: 'video-3',
        title: '八段锦养生功 - 古法新传',
        description: '传统八段锦功法，结合现代养生理念，调理五脏六腑，平衡身心。详解：八段锦起源、动作要领、呼吸配合、养生机理等精华内容。',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video3.mp4',
        price: 149,
        originalPrice: 199,
        duration: 2700, // 45分钟
        instructor: '张慧明师父',
        categoryId: categories[2].id,
        tags: '["养生", "保健", "中老年"]',
        difficulty: 'BEGINNER',
        rating: 4.7
      }
    }),
    prisma.video.upsert({
      where: { id: 'video-4' },
      update: {},
      create: {
        id: 'video-4',
        title: '武当剑法秘传 - 太乙玄门剑',
        description: '武当山传承的古法剑术，融合道家哲学与武学精髓。课程包括：剑法心诀、基础剑式、太乙剑谱、剑意修炼等武当秘传剑法。',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video4.mp4',
        price: 179,
        originalPrice: 249,
        duration: 4200, // 70分钟
        instructor: '赵无极真人',
        categoryId: categories[3].id,
        tags: '["太极剑", "器械", "32式"]',
        difficulty: 'INTERMEDIATE',
        rating: 4.6
      }
    }),
    prisma.video.upsert({
      where: { id: 'video-5' },
      update: {},
      create: {
        id: 'video-5',
        title: '免费体验：武学入门 - 站桩筑基',
        description: '免费体验课程，传授武学修炼的根基 - 站桩功法。学习正确的站桩姿势、呼吸要领、意念导引等筑基要诀，为后续修炼打下坚实基础。',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video5.mp4',
        price: 0, // 免费课程
        originalPrice: 0,
        duration: 1800, // 30分钟
        instructor: '李玄德师父',
        categoryId: categories[0].id,
        tags: '["免费", "体验", "基本功"]',
        difficulty: 'BEGINNER',
        rating: 4.5
      }
    })
  ])

  console.log('示例视频创建完成:', videos.length)

  // 为视频创建章节
  for (const video of videos) {
    if (video.price > 0) { // 只为付费视频创建章节
      await prisma.chapter.createMany({
        data: [
          {
            videoId: video.id,
            title: '课程介绍',
            duration: 300,
            order: 1,
            isFree: true
          },
          {
            videoId: video.id,
            title: '基础理论',
            duration: 600,
            order: 2,
            isFree: false
          },
          {
            videoId: video.id,
            title: '动作演示',
            duration: 900,
            order: 3,
            isFree: false
          },
          {
            videoId: video.id,
            title: '练习要点',
            duration: 600,
            order: 4,
            isFree: false
          }
        ]
      })
    }
  }

  console.log('视频章节创建完成')

  // 创建一些示例购买记录
  await prisma.purchase.createMany({
    data: [
      {
        userId: testUsers[0].id,
        videoId: videos[0].id,
        price: videos[0].price
      },
      {
        userId: testUsers[1].id,
        videoId: videos[1].id,
        price: videos[1].price
      }
    ]
  })

  console.log('示例购买记录创建完成')

  console.log('数据库初始化完成！')
  console.log('管理员账号: admin@example.com / admin123')
  console.log('测试用户: user1@example.com / user123')
  console.log('测试用户: user2@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
