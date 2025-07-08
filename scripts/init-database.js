// 数据库初始化脚本
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'sh-cdb-5c2dihj4.sql.tencentcdb.com',
  user: 'root',
  password: 'Dhc0521dhc@',
  port: 29116,
  charset: 'utf8mb4',
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
};

async function initDatabase() {
  let connection;
  
  try {
    console.log('🔗 连接到MySQL服务器...');
    connection = await mysql.createConnection(DB_CONFIG);
    
    // 创建数据库
    console.log('📊 创建数据库...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS pandagongfu_hui_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    // 选择数据库
    await connection.execute('USE pandagongfu_hui_prod');
    
    // 创建用户表
    console.log('👥 创建用户表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(500),
        role ENUM('user', 'admin') DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建视频分类表
    console.log('📂 创建视频分类表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        slug VARCHAR(100) UNIQUE NOT NULL,
        parent_id INT,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_slug (slug),
        INDEX idx_parent (parent_id),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建视频表
    console.log('🎥 创建视频表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        duration INT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        category_id INT,
        instructor_id INT,
        difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        is_published BOOLEAN DEFAULT FALSE,
        view_count INT DEFAULT 0,
        purchase_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category_id),
        INDEX idx_instructor (instructor_id),
        INDEX idx_published (is_published),
        INDEX idx_price (price)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建订单表
    console.log('🛒 创建订单表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_payment (payment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建订单项表
    console.log('📋 创建订单项表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        video_id INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        INDEX idx_order (order_id),
        INDEX idx_video (video_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建佣金表
    console.log('💰 创建佣金表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS commissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        order_id INT NOT NULL,
        video_id INT NOT NULL,
        commission_rate DECIMAL(5,4) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'approved', 'paid') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_order (order_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 插入初始数据
    console.log('🌱 插入初始数据...');
    
    // 插入默认分类
    await connection.execute(`
      INSERT IGNORE INTO categories (name, description, slug, sort_order) VALUES
      ('太极拳', '传统太极拳教学视频', 'taijiquan', 1),
      ('八卦掌', '八卦掌基础与进阶教程', 'baguazhang', 2),
      ('形意拳', '形意拳技法教学', 'xingyiquan', 3),
      ('武当功夫', '武当派传统功夫', 'wudang', 4),
      ('基础功法', '基本功训练教程', 'basics', 5)
    `);
    
    // 插入管理员用户
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123456', 12);
    
    await connection.execute(`
      INSERT IGNORE INTO users (email, password_hash, name, role, is_verified) VALUES
      ('admin@pandagongfu.com', ?, '管理员', 'admin', TRUE)
    `, [adminPassword]);
    
    console.log('✅ 数据库初始化完成！');
    console.log('📊 数据库：pandagongfu_hui_prod');
    console.log('👤 管理员账号：admin@pandagongfu.com');
    console.log('🔑 管理员密码：admin123456');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败：', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行初始化
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('🎉 数据库初始化成功完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 初始化失败：', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };
