import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        category: true,
        chapters: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { purchases: true }
        }
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: '视频不存在' },
        { status: 404 }
      )
    }

    // 格式化返回数据
    const formattedVideo = {
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      videoUrl: video.videoUrl,
      price: video.price,
      originalPrice: video.originalPrice,
      duration: video.duration,
      rating: video.rating,
      students: video._count.purchases,
      instructor: video.instructor,
      category: video.category.name,
      tags: video.tags,
      difficulty: video.difficulty,
      isFree: video.price === 0,
      createdAt: video.createdAt,
      chapters: video.chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        duration: chapter.duration,
        isFree: chapter.isFree,
        order: chapter.order
      })),
      instructorInfo: {
        name: video.instructor,
        avatar: '/api/placeholder/100/100',
        bio: '专业讲师，拥有丰富的教学经验。',
        experience: '10年教学经验',
        students: video._count.purchases
      }
    }

    return NextResponse.json({ video: formattedVideo })

  } catch (error) {
    console.error('Get video error:', error)
    return NextResponse.json(
      { error: '获取视频详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 这里应该验证用户是否为管理员
    const videoId = params.id
    const updateData = await request.json()

    const video = await prisma.video.update({
      where: { id: videoId },
      data: updateData,
      include: {
        category: true
      }
    })

    return NextResponse.json({
      message: '视频更新成功',
      video
    })

  } catch (error) {
    console.error('Update video error:', error)
    return NextResponse.json(
      { error: '更新视频失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 这里应该验证用户是否为管理员
    const videoId = params.id

    await prisma.video.delete({
      where: { id: videoId }
    })

    return NextResponse.json({
      message: '视频删除成功'
    })

  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json(
      { error: '删除视频失败' },
      { status: 500 }
    )
  }
}
