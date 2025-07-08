#!/usr/bin/env node

/**
 * 性能优化验证脚本
 * 验证所有性能优化功能是否正常工作
 */

const http = require('http')
const { performance } = require('perf_hooks')

const BASE_URL = 'http://localhost:3000'

// 测试用例
const tests = [
  {
    name: '主页性能',
    path: '/',
    expectedStatus: 200,
    maxTime: 2000
  },
  {
    name: '课程页面性能',
    path: '/courses',
    expectedStatus: 200,
    maxTime: 2000
  },
  {
    name: '性能分析API',
    path: '/api/analytics/performance',
    expectedStatus: 200,
    maxTime: 1000
  },
  {
    name: '视频API',
    path: '/api/videos',
    expectedStatus: 200,
    maxTime: 1000
  }
]

// HTTP请求函数
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now()
    
    const req = http.request(url, { method: 'GET' }, (res) => {
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)
      
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          responseTime,
          headers: res.headers,
          size: data.length
        })
      })
    })
    
    req.on('error', reject)
    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
    
    req.end()
  })
}

// 检查安全头
function checkSecurityHeaders(headers) {
  const required = [
    'x-xss-protection',
    'x-frame-options', 
    'x-content-type-options',
    'content-security-policy'
  ]
  
  const missing = required.filter(h => !headers[h])
  return {
    passed: missing.length === 0,
    missing
  }
}

// 运行测试
async function runTest(test) {
  console.log(`\n🧪 ${test.name}`)
  console.log(`📍 ${test.path}`)
  
  try {
    const result = await makeRequest(`${BASE_URL}${test.path}`)
    
    // 状态码检查
    const statusOK = result.status === test.expectedStatus
    console.log(`📊 状态: ${result.status} ${statusOK ? '✅' : '❌'}`)
    
    // 响应时间检查
    const timeOK = result.responseTime <= test.maxTime
    console.log(`⏱️  时间: ${result.responseTime}ms ${timeOK ? '✅' : '❌'} (最大: ${test.maxTime}ms)`)
    
    // 安全头检查
    const security = checkSecurityHeaders(result.headers)
    console.log(`🔒 安全: ${security.passed ? '✅' : '❌'}`)
    if (!security.passed) {
      console.log(`   缺失: ${security.missing.join(', ')}`)
    }
    
    // 缓存头检查
    const hasCache = !!result.headers['cache-control']
    console.log(`💾 缓存: ${hasCache ? '✅' : '❌'}`)
    
    // 响应大小
    console.log(`📦 大小: ${(result.size / 1024).toFixed(1)}KB`)
    
    return {
      name: test.name,
      passed: statusOK && timeOK,
      responseTime: result.responseTime,
      security: security.passed,
      cache: hasCache
    }
  } catch (error) {
    console.log(`❌ 错误: ${error.message}`)
    return {
      name: test.name,
      passed: false,
      error: error.message
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 性能优化验证开始...')
  console.log(`🎯 服务器: ${BASE_URL}`)
  
  const results = []
  
  for (const test of tests) {
    const result = await runTest(test)
    results.push(result)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // 生成报告
  console.log('\n📋 测试报告')
  console.log('='.repeat(40))
  
  const passed = results.filter(r => r.passed).length
  const total = results.length
  const passRate = Math.round((passed / total) * 100)
  
  console.log(`✅ 通过率: ${passed}/${total} (${passRate}%)`)
  
  // 性能统计
  const times = results.filter(r => r.responseTime).map(r => r.responseTime)
  if (times.length > 0) {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    const max = Math.max(...times)
    const min = Math.min(...times)
    
    console.log(`⏱️  平均响应: ${avg}ms`)
    console.log(`⏱️  最大响应: ${max}ms`)
    console.log(`⏱️  最小响应: ${min}ms`)
  }
  
  // 安全统计
  const securityPassed = results.filter(r => r.security).length
  console.log(`🔒 安全通过: ${Math.round((securityPassed / total) * 100)}%`)
  
  // 缓存统计
  const cachePassed = results.filter(r => r.cache).length
  console.log(`💾 缓存启用: ${Math.round((cachePassed / total) * 100)}%`)
  
  // 失败测试
  const failed = results.filter(r => !r.passed)
  if (failed.length > 0) {
    console.log('\n❌ 失败测试:')
    failed.forEach(test => {
      console.log(`   - ${test.name}`)
    })
  }
  
  console.log('\n🎉 验证完成!')
  
  // 性能等级评估
  let grade = 'F'
  if (passRate >= 95) grade = 'A+'
  else if (passRate >= 90) grade = 'A'
  else if (passRate >= 85) grade = 'B+'
  else if (passRate >= 80) grade = 'B'
  else if (passRate >= 70) grade = 'C'
  else if (passRate >= 60) grade = 'D'
  
  console.log(`🏆 性能等级: ${grade}`)
  
  process.exit(passRate >= 80 ? 0 : 1)
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  })
}
