import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Taiji Quan' },
      update: {},
      create: {
        name: 'Taiji Quan',
        description: 'Traditional Taiji martial arts, balancing yin and yang',
        slug: 'taiji-quan'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Internal Arts' },
      update: {},
      create: {
        name: 'Internal Arts',
        description: 'Wudang internal cultivation methods',
        slug: 'internal-arts'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Health Qigong' },
      update: {},
      create: {
        name: 'Health Qigong',
        description: 'Traditional health and wellness practices',
        slug: 'health-qigong'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Wudang Secrets' },
      update: {},
      create: {
        name: 'Wudang Secrets',
        description: 'Ancient secret teachings from Wudang Mountain',
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
      username: 'Pandagongfu Admin',
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
        username: 'Zhang San',
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
        username: 'Li Si',
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
        title: 'Taiji Quan Fundamentals - The Way of Yin and Yang',
        description: 'Learn the core principles of Taiji philosophy and master the fundamental techniques. This course covers: Taiji theory essentials, basic standing meditation, yin-yang transformation principles, and beginner forms.',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video1.mp4',
        price: 99,
        originalPrice: 199,
        duration: 3600, // 60分钟
        instructor: 'Master Li Xuande',
        categoryId: categories[0].id,
        difficulty: 'BEGINNER',
        rating: 4.8
      }
    }),
    prisma.video.upsert({
      where: { id: 'video-2' },
      update: {},
      create: {
        id: 'video-2',
        title: 'Wudang Internal Arts - Dantian Cultivation Secrets',
        description: 'Learn the thousand-year-old internal cultivation methods from Wudang Mountain. Master dantian energy cultivation for health and longevity. Covers: energy circulation methods, breath regulation, qi pathways, and foundation building.',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video2.mp4',
        price: 199,
        originalPrice: 299,
        duration: 5400, // 90分钟
        instructor: 'Daoist Wang Qingxu',
        categoryId: categories[1].id,
        difficulty: 'ADVANCED',
        rating: 4.9
      }
    }),
    prisma.video.upsert({
      where: { id: 'video-3' },
      update: {},
      create: {
        id: 'video-3',
        title: 'Eight Pieces of Brocade - Ancient Wellness Practice',
        description: 'Traditional Baduanjin qigong combined with modern wellness concepts. Balance your body and mind through gentle movements. Covers: origins, movement principles, breathing techniques, and health benefits.',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video3.mp4',
        price: 149,
        originalPrice: 199,
        duration: 2700, // 45分钟
        instructor: 'Master Zhang Huiming',
        categoryId: categories[2].id,
        difficulty: 'BEGINNER',
        rating: 4.7
      }
    }),
    prisma.video.upsert({
      where: { id: 'video-4' },
      update: {},
      create: {
        id: 'video-4',
        title: 'Wudang Sword Secrets - Taiyi Mysterious Gate Sword',
        description: 'Ancient sword techniques from Wudang Mountain, combining Daoist philosophy with martial arts essence. Includes: sword principles, basic forms, Taiyi sword manual, and sword spirit cultivation.',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video4.mp4',
        price: 179,
        originalPrice: 249,
        duration: 4200, // 70分钟
        instructor: 'Master Zhao Wuji',
        categoryId: categories[3].id,
        difficulty: 'INTERMEDIATE',
        rating: 4.6
      }
    }),
    prisma.video.upsert({
      where: { id: 'video-5' },
      update: {},
      create: {
        id: 'video-5',
        title: 'Free Preview: Martial Arts Foundation - Standing Meditation',
        description: 'Free preview course teaching the foundation of martial arts - standing meditation practice. Learn proper posture, breathing techniques, and mental focus for building a solid foundation.',
        thumbnail: '/api/placeholder/400/225',
        videoUrl: 'https://example.com/video5.mp4',
        price: 0, // 免费课程
        originalPrice: 0,
        duration: 1800, // 30分钟
        instructor: 'Master Li Xuande',
        categoryId: categories[0].id,
        difficulty: 'BEGINNER',
        rating: 4.5,
        isFree: true
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
            title: 'Course Introduction',
            duration: 300,
            order: 1,
            isFree: true
          },
          {
            videoId: video.id,
            title: 'Basic Theory',
            duration: 600,
            order: 2,
            isFree: false
          },
          {
            videoId: video.id,
            title: 'Movement Demonstration',
            duration: 900,
            order: 3,
            isFree: false
          },
          {
            videoId: video.id,
            title: 'Practice Points',
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
