#!/usr/bin/env node

/**
 * 生产环境数据库迁移脚本
 * 用于将开发环境数据迁移到生产环境
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// 开发环境数据库连接
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DEV_DATABASE_URL || 'file:./dev.db'
    }
  }
});

// 生产环境数据库连接
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  console.log('🚀 开始数据迁移...');

  try {
    // 1. 迁移分类数据
    console.log('📁 迁移分类数据...');
    const categories = await devPrisma.category.findMany();
    for (const category of categories) {
      await prodPrisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    console.log(`✅ 迁移了 ${categories.length} 个分类`);

    // 2. 迁移标签数据
    console.log('🏷️ 迁移标签数据...');
    const tags = await devPrisma.tag.findMany();
    for (const tag of tags) {
      await prodPrisma.tag.upsert({
        where: { id: tag.id },
        update: tag,
        create: tag
      });
    }
    console.log(`✅ 迁移了 ${tags.length} 个标签`);

    // 3. 迁移视频数据
    console.log('🎥 迁移视频数据...');
    const videos = await devPrisma.video.findMany({
      include: {
        videoTags: true
      }
    });
    
    for (const video of videos) {
      const { videoTags, ...videoData } = video;
      
      // 创建视频
      await prodPrisma.video.upsert({
        where: { id: video.id },
        update: videoData,
        create: videoData
      });

      // 创建视频标签关联
      for (const videoTag of videoTags) {
        await prodPrisma.videoTag.upsert({
          where: { 
            videoId_tagId: {
              videoId: videoTag.videoId,
              tagId: videoTag.tagId
            }
          },
          update: videoTag,
          create: videoTag
        });
      }
    }
    console.log(`✅ 迁移了 ${videos.length} 个视频`);

    // 4. 迁移用户数据（仅管理员用户）
    console.log('👤 迁移管理员用户...');
    const adminUsers = await devPrisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    
    for (const user of adminUsers) {
      await prodPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`✅ 迁移了 ${adminUsers.length} 个管理员用户`);

    console.log('🎉 数据迁移完成！');

  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
    throw error;
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

async function createInitialData() {
  console.log('🌱 创建初始数据...');

  try {
    // 创建默认管理员用户
    const adminUser = await prodPrisma.user.upsert({
      where: { email: 'admin@pandagongfu.com' },
      update: {},
      create: {
        id: 'admin-user-001',
        username: 'admin',
        email: 'admin@pandagongfu.com',
        password: '$2b$10$rQZ9QmjytWIeVqNJBNdOHOKEbhS6rQZ9QmjytWIeVqNJBNdOHOKEbh', // 默认密码: admin123
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ 创建了默认管理员用户');

    // 创建默认分类
    const defaultCategories = [
      {
        id: 'cat-taiji',
        name: 'Taiji Quan',
        description: 'Traditional Taiji martial arts, balancing yin and yang',
        slug: 'taiji-quan',
        order: 1
      },
      {
        id: 'cat-qigong',
        name: 'Health Qigong',
        description: 'Traditional health and wellness practices',
        slug: 'health-qigong',
        order: 2
      },
      {
        id: 'cat-wudang',
        name: 'Wudang Secrets',
        description: 'Ancient secret teachings from Wudang Mountain',
        slug: 'wudang-secrets',
        order: 3
      }
    ];

    for (const category of defaultCategories) {
      await prodPrisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }

    console.log('✅ 创建了默认分类');

    console.log('🎉 初始数据创建完成！');

  } catch (error) {
    console.error('❌ 初始数据创建失败:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'migrate':
      await migrateData();
      break;
    case 'init':
      await createInitialData();
      break;
    case 'full':
      await createInitialData();
      await migrateData();
      break;
    default:
      console.log('使用方法:');
      console.log('  node migrate-to-production.js init    # 创建初始数据');
      console.log('  node migrate-to-production.js migrate # 迁移开发环境数据');
      console.log('  node migrate-to-production.js full    # 完整迁移（初始数据 + 开发数据）');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
