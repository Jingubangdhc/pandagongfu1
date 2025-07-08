import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/error-boundary'
import { NetworkStatusProvider } from '@/components/network-status'
import { PerformanceProvider, PerformanceDebugger } from '@/components/performance/performance-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pandagongfu-慧 - 传统武学智慧传承平台',
  description: '传承千年武学精髓，融合现代教学理念，让传统功夫智慧在新时代绽放光彩',
  keywords: '太极拳,武当功法,内功心法,八段锦,传统武学,功夫,养生,气功',
  authors: [{ name: 'Pandagongfu-慧' }],
  openGraph: {
    title: 'Pandagongfu-慧 - 传统武学智慧传承平台',
    description: '传承千年武学精髓，融合现代教学理念，让传统功夫智慧在新时代绽放光彩',
    type: 'website',
    locale: 'zh_CN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <PerformanceProvider>
          <ErrorBoundary>
            <NetworkStatusProvider>
              <Providers>
                <div className="min-h-screen bg-background">
                  {children}
                </div>
                <Toaster />
              </Providers>
            </NetworkStatusProvider>
          </ErrorBoundary>
          <PerformanceDebugger />
        </PerformanceProvider>
      </body>
    </html>
  )
}
