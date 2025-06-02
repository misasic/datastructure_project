const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

async function createTables() {
  let connection;
  try {
    console.log('开始创建表...');
    console.log('数据库配置:', {
      host: config.db.host,
      user: config.db.user,
      database: config.db.database,
      port: config.db.port
    });

    // 读取 SQL 文件
    const sqlFile = await fs.readFile(path.join(__dirname, 'create_tables.sql'), 'utf8');
    console.log('SQL 文件内容已读取');
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      multipleStatements: true // 允许执行多条 SQL 语句
    });

    console.log('数据库连接成功');

    // 检查表是否存在
    const [tables] = await connection.query('SHOW TABLES');
    console.log('现有表:', tables);

    // 执行 SQL 文件中的语句
    console.log('开始执行SQL语句...');
    await connection.query(sqlFile);
    console.log('SQL 执行成功');

    // 验证表是否创建成功
    const [newTables] = await connection.query('SHOW TABLES');
    console.log('更新后的表:', newTables);

    // 检查 diaries 表结构
    const [columns] = await connection.query('DESCRIBE diaries');
    console.log('diaries 表结构:', columns);

    console.log('表创建成功！');
  } catch (error) {
    console.error('创建表时出错:', error);
    if (error.code) {
      console.error('错误代码:', error.code);
      console.error('SQL 状态:', error.sqlState);
      console.error('SQL 消息:', error.sqlMessage);
    }
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行创建表
createTables().catch(console.error); 