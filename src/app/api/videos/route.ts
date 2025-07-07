import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'newest'

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    if (category && category !== '全部') {
      where.category = {
        name: category
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { instructor: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 构建排序条件
    let orderBy: any = { createdAt: 'desc' } // 默认按创建时间排序

    switch (sortBy) {
      case 'popular':
        orderBy = { students: 'desc' }
        break
      case 'price-low':
        orderBy = { price: 'asc' }
        break
      case 'price-high':
        orderBy = { price: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
    }

    // 查询视频
    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          _count: {
            select: { purchases: true }
          }
        }
      }),
      prisma.video.count({ where })
    ])

    // 格式化返回数据
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      price: video.price,
      originalPrice: video.originalPrice,
      duration: video.duration,
      rating: video.rating,
      students: video._count.purchases,
      instructor: video.instructor,
      category: video.category.name,
      isFree: video.price === 0,
      createdAt: video.createdAt
    }))

    return NextResponse.json({
      videos: formattedVideos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get videos error:', error)
    return NextResponse.json(
      { error: '获取视频列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 这里应该验证用户是否为管理员
    const {
      title,
      description,
      thumbnail,
      videoUrl,
      price,
      originalPrice,
      duration,
      instructor,
      categoryId,
      tags,
      difficulty
    } = await request.json()

    if (!title || !description || !videoUrl || !categoryId) {
      return NextResponse.json(
        { error: '标题、描述、视频链接和分类不能为空' },
        { status: 400 }
      )
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        thumbnail,
        videoUrl,
        price: price || 0,
        originalPrice,
        duration: duration || 0,
        instructor: instructor || '未知讲师',
        categoryId,
        tags: tags || [],
        difficulty: difficulty || '初级'
      },
      include: {
        category: true
      }
    })

    return NextResponse.json({
      message: '视频创建成功',
      video
    }, { status: 201 })

  } catch (error) {
    console.error('Create video error:', error)
    return NextResponse.json(
      { error: '创建视频失败' },
      { status: 500 }
    )
  }
}
