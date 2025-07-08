// CloudBase API 服务器
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 基础路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API服务运行正常' });
});

// 用户认证路由
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 这里需要连接数据库验证用户
    // 暂时返回模拟数据
    const token = jwt.sign(
      { userId: 1, email },
      process.env.JWT_SECRET || 'temp-secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: { id: 1, email, name: '测试用户' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 视频列表路由
app.get('/api/videos', (req, res) => {
  res.json({
    success: true,
    videos: [
      {
        id: 1,
        title: '太极拳基础教学',
        description: '适合初学者的太极拳入门课程',
        price: 99,
        thumbnail: '/images/taiji-basic.jpg'
      }
    ]
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

// CloudBase 函数入口
exports.main = async (event, context) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      
      // 模拟HTTP请求
      const req = {
        method: event.httpMethod || 'GET',
        url: event.path || '/',
        headers: event.headers || {},
        body: event.body || ''
      };
      
      // 处理请求
      app(req, {
        status: (code) => ({ json: (data) => resolve({ statusCode: code, body: JSON.stringify(data) }) }),
        json: (data) => resolve({ statusCode: 200, body: JSON.stringify(data) }),
        send: (data) => resolve({ statusCode: 200, body: data })
      });
    });
  });
};

module.exports = app;
