import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTags() {
  console.log('开始创建标签数据...')

  // 技能水平标签
  await prisma.tag.upsert({
    where: { name: '初学者' },
    update: {},
    create: {
      name: '初学者',
      description: '适合刚开始学习的新手',
      color: '#22C55E',
      icon: '🌱',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '进阶' },
    update: {},
    create: {
      name: '进阶',
      description: '有一定基础的学习者',
      color: '#F59E0B',
      icon: '🌿',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '高级' },
    update: {},
    create: {
      name: '高级',
      description: '有丰富经验的练习者',
      color: '#EF4444',
      icon: '🌳',
      isActive: true
    }
  })

  // 练习时长标签
  await prisma.tag.upsert({
    where: { name: '短时练习' },
    update: {},
    create: {
      name: '短时练习',
      description: '15分钟以内的练习',
      color: '#06B6D4',
      icon: '⏱️',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '中等时长' },
    update: {},
    create: {
      name: '中等时长',
      description: '15-45分钟的练习',
      color: '#8B5CF6',
      icon: '⏰',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '长时练习' },
    update: {},
    create: {
      name: '长时练习',
      description: '45分钟以上的练习',
      color: '#EC4899',
      icon: '⏳',
      isActive: true
    }
  })

  // 练习场所标签
  await prisma.tag.upsert({
    where: { name: '室内练习' },
    update: {},
    create: {
      name: '室内练习',
      description: '适合在室内进行的练习',
      color: '#84CC16',
      icon: '🏠',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '户外练习' },
    update: {},
    create: {
      name: '户外练习',
      description: '适合在户外进行的练习',
      color: '#10B981',
      icon: '🌲',
      isActive: true
    }
  })

  // 身体部位标签
  await prisma.tag.upsert({
    where: { name: '全身练习' },
    update: {},
    create: {
      name: '全身练习',
      description: '锻炼全身的综合练习',
      color: '#F97316',
      icon: '🧘',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '上肢练习' },
    update: {},
    create: {
      name: '上肢练习',
      description: '主要锻炼手臂和肩膀',
      color: '#3B82F6',
      icon: '💪',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '下肢练习' },
    update: {},
    create: {
      name: '下肢练习',
      description: '主要锻炼腿部和臀部',
      color: '#8B5CF6',
      icon: '🦵',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '核心练习' },
    update: {},
    create: {
      name: '核心练习',
      description: '主要锻炼腰腹核心肌群',
      color: '#EF4444',
      icon: '🎯',
      isActive: true
    }
  })

  // 特殊功效标签
  await prisma.tag.upsert({
    where: { name: '减压放松' },
    update: {},
    create: {
      name: '减压放松',
      description: '帮助缓解压力和放松身心',
      color: '#06B6D4',
      icon: '😌',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '提升专注' },
    update: {},
    create: {
      name: '提升专注',
      description: '帮助提高注意力和专注力',
      color: '#7C3AED',
      icon: '🎯',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '改善睡眠' },
    update: {},
    create: {
      name: '改善睡眠',
      description: '有助于改善睡眠质量',
      color: '#6366F1',
      icon: '😴',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '增强体质' },
    update: {},
    create: {
      name: '增强体质',
      description: '提高身体素质和免疫力',
      color: '#DC2626',
      icon: '💪',
      isActive: true
    }
  })

  // 年龄群体标签
  await prisma.tag.upsert({
    where: { name: '青少年' },
    update: {},
    create: {
      name: '青少年',
      description: '适合青少年练习',
      color: '#F59E0B',
      icon: '👦',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '成年人' },
    update: {},
    create: {
      name: '成年人',
      description: '适合成年人练习',
      color: '#059669',
      icon: '👨',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '老年人' },
    update: {},
    create: {
      name: '老年人',
      description: '适合老年人练习',
      color: '#7C3AED',
      icon: '👴',
      isActive: true
    }
  })

  // 特色标签
  await prisma.tag.upsert({
    where: { name: '热门推荐' },
    update: {},
    create: {
      name: '热门推荐',
      description: '用户热门推荐的内容',
      color: '#EF4444',
      icon: '🔥',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '新手友好' },
    update: {},
    create: {
      name: '新手友好',
      description: '特别适合新手学习',
      color: '#22C55E',
      icon: '✨',
      isActive: true
    }
  })

  await prisma.tag.upsert({
    where: { name: '经典传承' },
    update: {},
    create: {
      name: '经典传承',
      description: '传统经典的练习方法',
      color: '#92400E',
      icon: '📜',
      isActive: true
    }
  })

  console.log('标签数据创建完成！')
}

seedTags()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
