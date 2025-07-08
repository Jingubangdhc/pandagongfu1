// SQLite数据库初始化脚本
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

async function initSQLiteDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ 连接SQLite失败：', err);
        reject(err);
        return;
      }
      console.log('🔗 连接到SQLite数据库成功');
    });

    // 开启外键约束
    db.run('PRAGMA foreign_keys = ON');

    // 创建表的SQL语句
    const createTables = [
      // 用户表
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // 分类表
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        slug TEXT UNIQUE NOT NULL,
        parent_id INTEGER,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      )`,

      // 视频表
      `CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        duration INTEGER,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        category_id INTEGER,
        instructor_id INTEGER,
        difficulty_level TEXT DEFAULT 'beginner' CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced')),
        is_published BOOLEAN DEFAULT FALSE,
        view_count INTEGER DEFAULT 0,
        purchase_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
      )`,

      // 订单表
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'failed', 'refunded')),
        payment_method TEXT,
        payment_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // 订单项表
      `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        video_id INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )`,

      // 佣金表
      `CREATE TABLE IF NOT EXISTS commissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_id INTEGER NOT NULL,
        video_id INTEGER NOT NULL,
        commission_rate DECIMAL(5,4) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'paid')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )`
    ];

    // 创建索引
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)',
      'CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published)',
      'CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status)'
    ];

    // 串行执行创建表
    let tableIndex = 0;
    function createNextTable() {
      if (tableIndex >= createTables.length) {
        // 所有表创建完成，开始创建索引
        createIndexes.forEach((sql, index) => {
          db.run(sql, (err) => {
            if (err) {
              console.error(`❌ 创建索引失败 ${index + 1}:`, err);
            } else {
              console.log(`✅ 创建索引 ${index + 1}/${createIndexes.length} 成功`);
            }
          });
        });
        // 插入初始数据
        insertInitialData(db, resolve, reject);
        return;
      }

      const sql = createTables[tableIndex];
      db.run(sql, (err) => {
        if (err) {
          console.error(`❌ 创建表失败 ${tableIndex + 1}:`, err);
          reject(err);
          return;
        }
        console.log(`✅ 创建表 ${tableIndex + 1}/${createTables.length} 成功`);
        tableIndex++;
        createNextTable();
      });
    }

    createNextTable();
  });
}

async function insertInitialData(db, resolve, reject) {
  try {
    console.log('🌱 插入初始数据...');

    // 插入分类
    const categories = [
      ['太极拳', '传统太极拳教学视频', 'taijiquan', 1],
      ['八卦掌', '八卦掌基础与进阶教程', 'baguazhang', 2],
      ['形意拳', '形意拳技法教学', 'xingyiquan', 3],
      ['武当功夫', '武当派传统功夫', 'wudang', 4],
      ['基础功法', '基本功训练教程', 'basics', 5]
    ];

    const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, description, slug, sort_order) VALUES (?, ?, ?, ?)');
    categories.forEach(cat => {
      insertCategory.run(cat);
    });
    insertCategory.finalize();

    // 插入管理员用户
    const adminPassword = await bcrypt.hash('admin123456', 12);
    const insertAdmin = db.prepare('INSERT OR IGNORE INTO users (email, password_hash, name, role, is_verified) VALUES (?, ?, ?, ?, ?)');
    insertAdmin.run('admin@pandagongfu.com', adminPassword, '管理员', 'admin', true);
    insertAdmin.finalize();

    // 插入示例视频
    const videos = [
      ['太极拳基础入门', '适合初学者的太极拳基础教程，从基本功开始学习', 'https://example.com/video1.mp4', 'https://example.com/thumb1.jpg', 99.00, 1, 1, 'beginner', true],
      ['八卦掌基本步法', '八卦掌的基础步法训练，掌握正确的行走方式', 'https://example.com/video2.mp4', 'https://example.com/thumb2.jpg', 129.00, 2, 1, 'beginner', true],
      ['形意拳五行拳', '形意拳核心技法五行拳的详细讲解', 'https://example.com/video3.mp4', 'https://example.com/thumb3.jpg', 159.00, 3, 1, 'intermediate', true]
    ];

    const insertVideo = db.prepare('INSERT OR IGNORE INTO videos (title, description, video_url, thumbnail_url, price, category_id, instructor_id, difficulty_level, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    videos.forEach(video => {
      insertVideo.run(video);
    });
    insertVideo.finalize();

    console.log('✅ 初始数据插入完成！');
    console.log('📊 数据库：database.sqlite');
    console.log('👤 管理员账号：admin@pandagongfu.com');
    console.log('🔑 管理员密码：admin123456');

    db.close((err) => {
      if (err) {
        console.error('❌ 关闭数据库失败：', err);
        reject(err);
      } else {
        console.log('🎉 SQLite数据库初始化完成！');
        resolve();
      }
    });

  } catch (error) {
    console.error('❌ 插入初始数据失败：', error);
    reject(error);
  }
}

// 运行初始化
if (require.main === module) {
  initSQLiteDatabase()
    .then(() => {
      console.log('🎉 数据库初始化成功完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 初始化失败：', error);
      process.exit(1);
    });
}

module.exports = { initSQLiteDatabase };
