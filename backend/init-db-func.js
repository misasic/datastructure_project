/**
 * 初始化数据库表结构的函数
 * 与init-db.js不同，这个函数不会关闭数据库连接池
 */

async function initDatabase(db) {
  try {
    console.log('开始初始化数据库表结构...');
    
    // 检查用户表是否存在，如果不存在则创建
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        showpassword VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await db.query(createUsersTable);
    console.log('用户表已创建或已存在');
    
    // 创建景点表
    const createScenicSpotsTable = `
      CREATE TABLE IF NOT EXISTS scenic_spots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        image_url VARCHAR(255),
        popularity FLOAT DEFAULT 0,
        rating FLOAT DEFAULT 0,
        rating_count INT DEFAULT 0,
        keywords VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await db.query(createScenicSpotsTable);
    console.log('景点表已创建或已存在');
    
    // 创建学校表
    const createSchoolsTable = `
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        image_url VARCHAR(255),
        popularity FLOAT DEFAULT 0,
        rating FLOAT DEFAULT 0,
        rating_count INT DEFAULT 0,
        keywords VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await db.query(createSchoolsTable);
    console.log('学校表已创建或已存在');
    
    // 创建用户偏好表
    const createUserPreferencesTable = `
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(50) NOT NULL,
        interest_level FLOAT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY user_category (user_id, category)
      )
    `;
    
    await db.query(createUserPreferencesTable);
    console.log('用户偏好表已创建或已存在');
    
    console.log('数据库表结构初始化完成!');
    return { success: true };
  } catch (err) {
    console.error('数据库表结构初始化失败:', err);
    console.error('错误详情:', err.message);
    throw err;
  }
}

module.exports = { initDatabase }; 