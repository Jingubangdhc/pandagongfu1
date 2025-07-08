"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search, ShoppingCart, User, Menu, X, Home, BookOpen, Grid3X3, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser, useCart } from '@/components/providers'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useUser()
  const { items } = useCart()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // 跳转到搜索页面
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
      setIsMenuOpen(false) // 关闭移动端菜单
    }
  }

  // 关闭菜单当点击链接时
  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  // 防止移动端菜单打开时页面滚动
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // 清理函数
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
        {/* Logo - 移动端优化 */}
        <Link href="/" className="flex items-center space-x-2 touch-manipulation" onClick={handleLinkClick}>
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <span className="text-white font-bold text-base md:text-lg">慧</span>
          </div>
          <span className="font-bold text-lg md:text-xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent hidden sm:block">
            Pandagongfu-慧
          </span>
          <span className="font-bold text-base bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent sm:hidden">
            慧
          </span>
        </Link>

        {/* 导航菜单 - 桌面端 */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            首页
          </Link>
          <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">
            课程
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
            分类
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            关于我们
          </Link>
          <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors text-red-600">
            管理员入口
          </Link>
        </nav>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-sm mx-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="搜索课程..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* 右侧操作区 - 移动端优化 */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* 购物车 - 移动端优化 */}
          <Link href="/cart" className="relative" onClick={handleLinkClick}>
            <Button variant="ghost" size="icon" className="h-10 w-10 touch-manipulation">
              <ShoppingCart className="h-5 w-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Button>
          </Link>

          {/* 用户菜单 - 移动端优化 */}
          {user ? (
            <div className="flex items-center space-x-1 md:space-x-2">
              <Link href="/dashboard/learning" className="hidden md:block">
                <Button variant="ghost" size="sm" className="touch-manipulation">
                  学习中心
                </Button>
              </Link>
              <Link href="/dashboard" onClick={handleLinkClick}>
                <Button variant="ghost" size="icon" className="h-10 w-10 touch-manipulation">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="hidden md:flex touch-manipulation"
              >
                退出
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-1 md:space-x-2">
              <Link href="/login" onClick={handleLinkClick}>
                <Button variant="ghost" size="sm" className="text-xs md:text-sm touch-manipulation">
                  登录
                </Button>
              </Link>
              <Link href="/register" onClick={handleLinkClick}>
                <Button size="sm" className="text-xs md:text-sm touch-manipulation">
                  注册
                </Button>
              </Link>
            </div>
          )}

          {/* 移动端菜单按钮 - 优化 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 touch-manipulation"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* 移动端菜单 - 全面优化 */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/98 backdrop-blur-sm shadow-lg">
          <div className="container px-4 py-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* 移动端搜索 - 优化 */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="搜索课程..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base touch-manipulation"
                  style={{ fontSize: '16px' }} // 防止iOS缩放
                />
              </div>
              <Button type="submit" size="icon" className="h-12 w-12 touch-manipulation">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {/* 移动端导航 - 图标优化 */}
            <nav className="space-y-1">
              <Link
                href="/"
                className="flex items-center space-x-3 text-base font-medium hover:text-primary hover:bg-muted transition-colors py-3 px-4 rounded-lg touch-manipulation"
                onClick={handleLinkClick}
              >
                <Home className="h-5 w-5" />
                <span>首页</span>
              </Link>
              <Link
                href="/courses"
                className="flex items-center space-x-3 text-base font-medium hover:text-primary hover:bg-muted transition-colors py-3 px-4 rounded-lg touch-manipulation"
                onClick={handleLinkClick}
              >
                <BookOpen className="h-5 w-5" />
                <span>课程</span>
              </Link>
              <Link
                href="/categories"
                className="flex items-center space-x-3 text-base font-medium hover:text-primary hover:bg-muted transition-colors py-3 px-4 rounded-lg touch-manipulation"
                onClick={handleLinkClick}
              >
                <Grid3X3 className="h-5 w-5" />
                <span>分类</span>
              </Link>
              <Link
                href="/about"
                className="flex items-center space-x-3 text-base font-medium hover:text-primary hover:bg-muted transition-colors py-3 px-4 rounded-lg touch-manipulation"
                onClick={handleLinkClick}
              >
                <Info className="h-5 w-5" />
                <span>关于我们</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center space-x-3 text-base font-medium hover:text-primary hover:bg-muted transition-colors py-3 px-4 rounded-lg touch-manipulation text-red-600"
                onClick={handleLinkClick}
              >
                <User className="h-5 w-5" />
                <span>管理员入口</span>
              </Link>
            </nav>

            {/* 移动端用户操作区 */}
            {user ? (
              <div className="border-t pt-4 space-y-2">
                <Link
                  href="/dashboard/learning"
                  className="flex items-center space-x-3 text-base font-medium hover:text-primary hover:bg-muted transition-colors py-3 px-4 rounded-lg touch-manipulation"
                  onClick={handleLinkClick}
                >
                  <BookOpen className="h-5 w-5" />
                  <span>学习中心</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 text-base font-medium hover:text-primary hover:bg-muted transition-colors py-3 px-4 rounded-lg touch-manipulation"
                  onClick={handleLinkClick}
                >
                  <User className="h-5 w-5" />
                  <span>个人中心</span>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full justify-start space-x-3 h-12 touch-manipulation"
                >
                  <X className="h-5 w-5" />
                  <span>退出登录</span>
                </Button>
              </div>
            ) : (
              <div className="border-t pt-4 space-y-3">
                <Link href="/login" onClick={handleLinkClick}>
                  <Button variant="outline" className="w-full h-12 touch-manipulation">
                    登录
                  </Button>
                </Link>
                <Link href="/register" onClick={handleLinkClick}>
                  <Button className="w-full h-12 touch-manipulation">
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
