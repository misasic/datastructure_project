// 导入MySQL2的Promise版本，支持异步操作
const mysql = require('mysql2/promise');
// 导入数据库配置
const config = require('./config');

// 创建数据库连接池
// 连接池可以重用连接，提高性能
const pool = mysql.createPool(config.db);

/**
 * 执行SQL查询的通用方法
 * @param {string} sql - SQL查询语句
 * @param {Array} params - 查询参数数组
 * @returns {Promise<Array>} 查询结果
 */
const query = async (sql, params) => {
  try {
    // 使用解构赋值获取查询结果
    const [rows] = await pool.query(sql, params);
    // 确保返回的是数组
    return Array.isArray(rows) ? rows : [rows];
  } catch (err) {
    console.error('数据库查询错误:', err);
    throw err;
  }
};

/**
 * 事务处理方法
 * @param {Function} callback - 事务回调函数
 * @returns {Promise<any>} 事务执行结果
 */
const transaction = async (callback) => {
  // 从连接池获取一个连接
  const connection = await pool.getConnection();
  try {
    // 开始事务
    await connection.beginTransaction();
    // 执行事务回调
    const result = await callback(connection);
    // 提交事务
    await connection.commit();
    return result;
  } catch (err) {
    // 发生错误时回滚事务
    await connection.rollback();
    throw err;
  } finally {
    // 无论成功失败，都释放连接回连接池
    connection.release();
  }
};

// 创建数据库表
const createTables = async () => {
  try {
    // 创建用户表
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        showpassword VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建日记表
    await query(`
      CREATE TABLE IF NOT EXISTS diaries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        content_compressed BOOLEAN DEFAULT FALSE,
        content_original_size INT,
        content_compressed_size INT,
        content_compression_ratio INT,
        content_compressed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 创建日记图片表
    await query(`
      CREATE TABLE IF NOT EXISTS diary_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        diary_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        animation_url VARCHAR(255),
        aigc_video_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE CASCADE
      )
    `);

    // 创建日记点赞表
    await query(`
      CREATE TABLE IF NOT EXISTS diary_likes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        diary_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (diary_id) REFERENCES diaries(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_like (diary_id, user_id)
      )
    `);

    console.log('数据库表创建成功');
  } catch (err) {
    console.error('创建数据库表失败:', err);
    throw err;
  }
};

// 初始化数据库
const initDatabase = async () => {
  try {
    await createTables();
  } catch (err) {
    console.error('初始化数据库失败:', err);
    throw err;
  }
};

// 确保users表有showpassword字段
async function ensureShowPasswordField() {
  try {
    const [columns] = await query(
      "SHOW COLUMNS FROM users LIKE 'showpassword'"
    );
    
    if (columns.length === 0) {
      console.log('添加showpassword字段到users表');
      await query(
        'ALTER TABLE users ADD COLUMN showpassword VARCHAR(255)'
      );
    }
  } catch (err) {
    console.error('检查/添加showpassword字段失败:', err);
  }
}

// 在数据库连接后调用
ensureShowPasswordField();

// 导出数据库操作方法
module.exports = { 
  query, 
  transaction, 
  pool,
  getConnection: () => pool.getConnection(),
  initDatabase
};