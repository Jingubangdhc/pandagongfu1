"use client"

import { createContext, useContext, useEffect, useState } from 'react'

// 用户上下文
interface User {
  id: string
  email: string
  username: string
  avatar?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
}

interface UserContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// 购物车上下文
interface CartItem {
  videoId: string
  title: string
  price: number
  thumbnail?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (videoId: string) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // 初始化用户状态
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // 这里应该验证token并获取用户信息
      // 暂时使用模拟数据
      setUser({
        id: '1',
        email: 'user@example.com',
        username: 'testuser',
        role: 'USER'
      })
    }
    setIsLoading(false)
  }, [])

  // 用户相关方法
  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 购物车相关方法
  const addItem = (item: CartItem) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.videoId === item.videoId)
      if (exists) return prev
      return [...prev, item]
    })
  }

  const removeItem = (videoId: string) => {
    setCartItems(prev => prev.filter(item => item.videoId !== videoId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const total = cartItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      <CartContext.Provider value={{ items: cartItems, addItem, removeItem, clearCart, total }}>
        {children}
      </CartContext.Provider>
    </UserContext.Provider>
  )
}
