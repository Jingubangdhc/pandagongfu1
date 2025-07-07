import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  const [width, height] = params.params
  const w = parseInt(width) || 400
  const h = parseInt(height) || 225

  // 创建SVG山水画风格的占位符
  const svg = `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#e0f2fe;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#b3e5fc;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#81d4fa;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#546e7a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#37474f;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#fff9c4;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#fff59d;stop-opacity:0.3" />
        </radialGradient>
      </defs>
      
      <!-- 天空背景 -->
      <rect width="100%" height="100%" fill="url(#skyGradient)"/>
      
      <!-- 太阳 -->
      <circle cx="${w * 0.8}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.08}" fill="url(#sunGradient)"/>
      
      <!-- 远山 -->
      <path d="M0,${h * 0.6} Q${w * 0.2},${h * 0.4} ${w * 0.4},${h * 0.5} T${w * 0.8},${h * 0.45} Q${w * 0.9},${h * 0.4} ${w},${h * 0.5} L${w},${h} L0,${h} Z" 
            fill="#78909c" opacity="0.6"/>
      
      <!-- 中山 -->
      <path d="M0,${h * 0.75} Q${w * 0.15},${h * 0.55} ${w * 0.3},${h * 0.65} T${w * 0.6},${h * 0.6} Q${w * 0.8},${h * 0.55} ${w},${h * 0.65} L${w},${h} L0,${h} Z" 
            fill="url(#mountainGradient)" opacity="0.8"/>
      
      <!-- 近山 -->
      <path d="M0,${h * 0.85} Q${w * 0.1},${h * 0.7} ${w * 0.2},${h * 0.75} T${w * 0.5},${h * 0.72} Q${w * 0.7},${h * 0.7} ${w},${h * 0.78} L${w},${h} L0,${h} Z" 
            fill="#455a64" opacity="0.9"/>
      
      <!-- 云雾 -->
      <ellipse cx="${w * 0.3}" cy="${h * 0.3}" rx="${w * 0.08}" ry="${h * 0.06}" fill="white" opacity="0.4"/>
      <ellipse cx="${w * 0.5}" cy="${h * 0.25}" rx="${w * 0.06}" ry="${h * 0.04}" fill="white" opacity="0.3"/>
      <ellipse cx="${w * 0.7}" cy="${h * 0.35}" rx="${w * 0.07}" ry="${h * 0.05}" fill="white" opacity="0.35"/>
      
      <!-- 水面反射 -->
      <rect x="0" y="${h * 0.85}" width="${w}" height="${h * 0.15}" fill="url(#skyGradient)" opacity="0.3"/>
      
      <!-- 文字水印 -->
      <text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-family="serif" font-size="${Math.min(w, h) * 0.08}" 
            fill="#37474f" opacity="0.6">Pandagongfu-慧</text>
      <text x="${w / 2}" y="${h / 2 + Math.min(w, h) * 0.06}" text-anchor="middle" font-family="serif" font-size="${Math.min(w, h) * 0.04}" 
            fill="#546e7a" opacity="0.5">${w}×${h}</text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
