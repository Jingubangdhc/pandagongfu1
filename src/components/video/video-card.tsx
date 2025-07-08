import Link from 'next/link'
import { Play, Star, Clock, Users, ShoppingCart } from 'lucide-react'
import { VideoThumbnail } from '@/components/optimized/optimized-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice, formatDuration } from '@/lib/utils'
import { useCart } from '@/components/providers'
import { useToast } from '@/hooks/use-toast'

interface VideoCardProps {
  video: {
    id: string
    title: string
    description: string
    thumbnail?: string
    price: number
    originalPrice?: number
    duration: number
    rating: number
    students: number
    instructor: string
    category: string
    isFree?: boolean
  }
  showAddToCart?: boolean
}

export function VideoCard({ video, showAddToCart = true }: VideoCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      id: video.id,
      videoId: video.id,
      title: video.title,
      price: video.price,
      thumbnail: video.thumbnail
    })

    toast({
      title: "已添加到购物车",
      description: `${video.title} 已添加到购物车`,
    })
  }

  const discountPercentage = video.originalPrice 
    ? Math.round((1 - video.price / video.originalPrice) * 100)
    : 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link href={`/video/${video.id}`}>
        <div className="relative aspect-video overflow-hidden">
          <VideoThumbnail
            src={video.thumbnail || '/api/placeholder/400/225'}
            alt={video.title}
            className="transition-transform duration-300 group-hover:scale-105"
            priority={false}
            quality={85}
          />
          
          {/* 播放按钮覆盖层 */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 rounded-full p-3">
              <Play className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* 价格标签 */}
          <div className="absolute top-2 left-2">
            {video.isFree ? (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                免费
              </span>
            ) : discountPercentage > 0 ? (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                -{discountPercentage}%
              </span>
            ) : null}
          </div>

          {/* 时长 */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {formatDuration(video.duration)}
          </div>
        </div>
      </Link>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span className="bg-muted px-2 py-1 rounded text-xs">{video.category}</span>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(video.duration)}</span>
          </div>
        </div>
        
        <CardTitle className="line-clamp-2 text-base leading-tight">
          <Link href={`/video/${video.id}`} className="hover:text-primary transition-colors">
            {video.title}
          </Link>
        </CardTitle>
        
        <CardDescription className="line-clamp-2 text-sm">
          {video.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{video.rating}</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className="text-xs">{video.students}</span>
            </div>
          </div>
          
          <div className="text-right">
            {video.isFree ? (
              <div className="text-lg font-bold text-green-600">免费</div>
            ) : (
              <>
                <div className="text-lg font-bold text-primary">
                  {formatPrice(video.price)}
                </div>
                {video.originalPrice && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatPrice(video.originalPrice)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          讲师：{video.instructor}
        </div>
      </CardContent>

      <CardFooter className="pt-0 space-x-2">
        <Button className="flex-1" asChild>
          <Link href={`/video/${video.id}`}>
            {video.isFree ? '立即观看' : '立即购买'}
          </Link>
        </Button>
        
        {showAddToCart && !video.isFree && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleAddToCart}
            className="shrink-0"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
