#!/usr/bin/env node

/**
 * 数据库索引优化性能测试脚本
 * 测试各种查询场景的响应时间
 */

const { performance } = require('perf_hooks');

// 测试配置
const BASE_URL = 'http://localhost:3008';
const TEST_ITERATIONS = 5; // 每个测试运行次数

// 测试用例定义
const testCases = [
  {
    name: '视频列表查询 - 默认排序',
    url: '/api/videos?page=1&limit=12',
    method: 'GET'
  },
  {
    name: '视频列表查询 - 按热门度排序',
    url: '/api/videos?page=1&limit=12&sortBy=popular',
    method: 'GET'
  },
  {
    name: '视频列表查询 - 按价格排序',
    url: '/api/videos?page=1&limit=12&sortBy=price-high',
    method: 'GET'
  },
  {
    name: '视频列表查询 - 按评分排序',
    url: '/api/videos?page=1&limit=12&sortBy=rating',
    method: 'GET'
  },
  {
    name: '视频列表查询 - 分类筛选',
    url: '/api/videos?category=Taiji%20Quan&page=1&limit=12',
    method: 'GET'
  },
  {
    name: '视频列表查询 - 搜索功能',
    url: '/api/videos?search=martial&page=1&limit=12',
    method: 'GET'
  },
  {
    name: '视频详情查询',
    url: '/api/videos/video-1',
    method: 'GET'
  },
  {
    name: '视频详情查询 - 包含章节',
    url: '/api/videos/video-2',
    method: 'GET'
  },
  {
    name: '分类列表查询',
    url: '/api/categories',
    method: 'GET'
  }
];

// 执行HTTP请求的函数
async function makeRequest(url, method = 'GET', headers = {}) {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    const data = await response.json();
    
    return {
      success: true,
      responseTime,
      status: response.status,
      dataSize: JSON.stringify(data).length
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    return {
      success: false,
      responseTime,
      error: error.message
    };
  }
}

// 运行单个测试用例
async function runTestCase(testCase) {
  console.log(`\n🧪 测试: ${testCase.name}`);
  console.log(`📍 URL: ${testCase.url}`);
  
  const results = [];
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    const result = await makeRequest(testCase.url, testCase.method);
    results.push(result);
    
    if (result.success) {
      console.log(`   第${i + 1}次: ${result.responseTime.toFixed(2)}ms (${result.status}) - ${(result.dataSize / 1024).toFixed(2)}KB`);
    } else {
      console.log(`   第${i + 1}次: 失败 - ${result.error}`);
    }
    
    // 避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 计算统计数据
  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length > 0) {
    const responseTimes = successfulResults.map(r => r.responseTime);
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minTime = Math.min(...responseTimes);
    const maxTime = Math.max(...responseTimes);
    
    console.log(`📊 统计结果:`);
    console.log(`   平均响应时间: ${avgTime.toFixed(2)}ms`);
    console.log(`   最快响应时间: ${minTime.toFixed(2)}ms`);
    console.log(`   最慢响应时间: ${maxTime.toFixed(2)}ms`);
    console.log(`   成功率: ${(successfulResults.length / TEST_ITERATIONS * 100).toFixed(1)}%`);
    
    return {
      testCase: testCase.name,
      avgTime,
      minTime,
      maxTime,
      successRate: successfulResults.length / TEST_ITERATIONS * 100
    };
  } else {
    console.log(`❌ 所有请求都失败了`);
    return {
      testCase: testCase.name,
      avgTime: 0,
      minTime: 0,
      maxTime: 0,
      successRate: 0
    };
  }
}

// 主测试函数
async function runPerformanceTests() {
  console.log('🚀 开始数据库索引优化性能测试');
  console.log(`📊 测试配置: 每个测试运行 ${TEST_ITERATIONS} 次`);
  console.log(`🌐 测试服务器: ${BASE_URL}`);
  console.log('=' * 60);
  
  const allResults = [];
  
  for (const testCase of testCases) {
    const result = await runTestCase(testCase);
    allResults.push(result);
  }
  
  // 生成总结报告
  console.log('\n' + '=' * 60);
  console.log('📈 性能测试总结报告');
  console.log('=' * 60);
  
  console.log('\n📋 详细结果:');
  allResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.testCase}`);
    console.log(`   平均响应时间: ${result.avgTime.toFixed(2)}ms`);
    console.log(`   响应时间范围: ${result.minTime.toFixed(2)}ms - ${result.maxTime.toFixed(2)}ms`);
    console.log(`   成功率: ${result.successRate.toFixed(1)}%`);
    console.log('');
  });
  
  // 性能等级评估
  const avgResponseTime = allResults.reduce((sum, r) => sum + r.avgTime, 0) / allResults.length;
  const overallSuccessRate = allResults.reduce((sum, r) => sum + r.successRate, 0) / allResults.length;
  
  console.log('🎯 整体性能评估:');
  console.log(`   平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   整体成功率: ${overallSuccessRate.toFixed(1)}%`);
  
  let performanceGrade = 'F';
  if (avgResponseTime < 100 && overallSuccessRate > 95) {
    performanceGrade = 'A+';
  } else if (avgResponseTime < 200 && overallSuccessRate > 90) {
    performanceGrade = 'A';
  } else if (avgResponseTime < 500 && overallSuccessRate > 85) {
    performanceGrade = 'B';
  } else if (avgResponseTime < 1000 && overallSuccessRate > 80) {
    performanceGrade = 'C';
  } else if (avgResponseTime < 2000 && overallSuccessRate > 70) {
    performanceGrade = 'D';
  }
  
  console.log(`   性能等级: ${performanceGrade}`);
  
  // 优化建议
  console.log('\n💡 优化建议:');
  if (avgResponseTime > 500) {
    console.log('   - 考虑添加更多数据库索引');
    console.log('   - 实施查询结果缓存');
    console.log('   - 优化复杂查询的执行计划');
  } else if (avgResponseTime > 200) {
    console.log('   - 考虑实施Redis缓存');
    console.log('   - 优化数据库连接池配置');
  } else {
    console.log('   - 性能表现优秀！');
    console.log('   - 可以考虑实施更高级的优化策略');
  }
  
  console.log('\n✅ 性能测试完成！');
}

// 检查服务器是否可用
async function checkServerAvailability() {
  try {
    const response = await fetch(`${BASE_URL}/api/videos?limit=1`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 主程序入口
async function main() {
  console.log('🔍 检查服务器可用性...');
  
  const serverAvailable = await checkServerAvailability();
  
  if (!serverAvailable) {
    console.error(`❌ 无法连接到服务器 ${BASE_URL}`);
    console.error('请确保开发服务器正在运行 (npm run dev)');
    process.exit(1);
  }
  
  console.log('✅ 服务器连接正常');
  
  await runPerformanceTests();
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runPerformanceTests, makeRequest };
