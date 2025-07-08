'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // 存储token
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // 根据用户角色跳转
        if (data.user.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(data.error || '登录失败')
      }
    } catch (error) {
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* 山水画背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 1200 800" className="w-full h-full object-cover">
            <path d="M0,400 Q200,300 400,350 T800,320 Q1000,300 1200,340 L1200,800 L0,800 Z" fill="#1e293b" opacity="0.8"/>
            <path d="M0,500 Q150,400 300,450 T600,420 Q800,400 1200,440 L1200,800 L0,800 Z" fill="#334155" opacity="0.6"/>
            <path d="M0,600 Q100,520 200,550 T500,530 Q700,520 1200,560 L1200,800 L0,800 Z" fill="#475569" opacity="0.4"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <span className="text-white font-bold text-xl">慧</span>
              </div>
            </div>
            <CardTitle className="text-2xl">登录 Pandagongfu-慧</CardTitle>
            <CardDescription>
              输入您的账号信息以访问您的学习中心
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入您的密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              还没有账号？{' '}
              <Link href="/register" className="text-primary hover:underline">
                立即注册
              </Link>
            </div>
            <div className="text-sm text-center">
              <Link href="/" className="text-muted-foreground hover:text-primary">
                返回首页
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
