import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCategories() {
  console.log('开始创建分类数据...')

  // 创建主分类
  const martialArts = await prisma.category.upsert({
    where: { slug: 'martial-arts' },
    update: {},
    create: {
      name: '武术功夫',
      description: '传统武术和现代功夫技法',
      slug: 'martial-arts',
      icon: '🥋',
      color: '#DC2626',
      order: 1,
      isActive: true
    }
  })

  const health = await prisma.category.upsert({
    where: { slug: 'health-wellness' },
    update: {},
    create: {
      name: '养生保健',
      description: '健康养生和身心调理',
      slug: 'health-wellness',
      icon: '🌿',
      color: '#059669',
      order: 2,
      isActive: true
    }
  })

  const philosophy = await prisma.category.upsert({
    where: { slug: 'philosophy' },
    update: {},
    create: {
      name: '哲学文化',
      description: '传统文化和哲学思想',
      slug: 'philosophy',
      icon: '📚',
      color: '#7C3AED',
      order: 3,
      isActive: true
    }
  })

  const meditation = await prisma.category.upsert({
    where: { slug: 'meditation' },
    update: {},
    create: {
      name: '冥想静心',
      description: '冥想练习和心灵修养',
      slug: 'meditation',
      icon: '🧘',
      color: '#0891B2',
      order: 4,
      isActive: true
    }
  })

  // 创建武术功夫子分类
  await prisma.category.upsert({
    where: { slug: 'taichi' },
    update: {},
    create: {
      name: '太极拳',
      description: '太极拳各种流派和技法',
      slug: 'taichi',
      icon: '☯️',
      color: '#DC2626',
      order: 1,
      parentId: martialArts.id,
      isActive: true
    }
  })

  await prisma.category.upsert({
    where: { slug: 'kungfu' },
    update: {},
    create: {
      name: '传统功夫',
      description: '少林、武当等传统功夫',
      slug: 'kungfu',
      icon: '🐉',
      color: '#DC2626',
      order: 2,
      parentId: martialArts.id,
      isActive: true
    }
  })

  await prisma.category.upsert({
    where: { slug: 'qigong' },
    update: {},
    create: {
      name: '气功',
      description: '气功练习和内功修炼',
      slug: 'qigong',
      icon: '💨',
      color: '#DC2626',
      order: 3,
      parentId: martialArts.id,
      isActive: true
    }
  })

  // 创建养生保健子分类
  await prisma.category.upsert({
    where: { slug: 'tcm' },
    update: {},
    create: {
      name: '中医养生',
      description: '中医理论和养生方法',
      slug: 'tcm',
      icon: '🌱',
      color: '#059669',
      order: 1,
      parentId: health.id,
      isActive: true
    }
  })

  await prisma.category.upsert({
    where: { slug: 'diet-therapy' },
    update: {},
    create: {
      name: '食疗养生',
      description: '药膳食疗和营养调理',
      slug: 'diet-therapy',
      icon: '🍵',
      color: '#059669',
      order: 2,
      parentId: health.id,
      isActive: true
    }
  })

  await prisma.category.upsert({
    where: { slug: 'massage' },
    update: {},
    create: {
      name: '按摩推拿',
      description: '传统按摩和推拿技法',
      slug: 'massage',
      icon: '👐',
      color: '#059669',
      order: 3,
      parentId: health.id,
      isActive: true
    }
  })

  // 创建哲学文化子分类
  await prisma.category.upsert({
    where: { slug: 'taoism' },
    update: {},
    create: {
      name: '道家思想',
      description: '道家哲学和修行理念',
      slug: 'taoism',
      icon: '☯️',
      color: '#7C3AED',
      order: 1,
      parentId: philosophy.id,
      isActive: true
    }
  })

  await prisma.category.upsert({
    where: { slug: 'buddhism' },
    update: {},
    create: {
      name: '佛学智慧',
      description: '佛教哲学和修行方法',
      slug: 'buddhism',
      icon: '🪷',
      color: '#7C3AED',
      order: 2,
      parentId: philosophy.id,
      isActive: true
    }
  })

  await prisma.category.upsert({
    where: { slug: 'confucianism' },
    update: {},
    create: {
      name: '儒家文化',
      description: '儒家思想和传统文化',
      slug: 'confucianism',
      icon: '📖',
      color: '#7C3AED',
      order: 3,
      parentId: philosophy.id,
      isActive: true
    }
  })

  // 创建冥想静心子分类
  await prisma.category.upsert({
    where: { slug: 'mindfulness' },
    update: {},
    create: {
      name: '正念冥想',
      description: '正念练习和觉察训练',
      slug: 'mindfulness',
      icon: '🧠',
      color: '#0891B2',
      order: 1,
      parentId: meditation.id,
      isActive: true
    }
  })

  await prisma.category.upsert({
    where: { slug: 'breathing' },
    update: {},
    create: {
      name: '呼吸法',
      description: '各种呼吸练习技法',
      slug: 'breathing',
      icon: '💨',
      color: '#0891B2',
      order: 2,
      parentId: meditation.id,
      isActive: true
    }
  })

  await prisma.category.upsert({
    where: { slug: 'visualization' },
    update: {},
    create: {
      name: '观想练习',
      description: '观想冥想和意象训练',
      slug: 'visualization',
      icon: '👁️',
      color: '#0891B2',
      order: 3,
      parentId: meditation.id,
      isActive: true
    }
  })

  console.log('分类数据创建完成！')
}

seedCategories()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
