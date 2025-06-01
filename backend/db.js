const mysql = require('mysql2/promise'); // 直接导入promise版本
const config = require('./config');

// 创建连接池
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true, // 启用命名参数
  decimalNumbers: true, // 正确处理DECIMAL类型
  connectTimeout: 10000, // 连接超时10秒
  dateStrings: true // 日期转为字符串
});

// 检测连接池错误
pool.on('error', (err) => {
  console.error('数据库连接池错误:', err);
});

// 封装查询方法
const query = async (sql, params) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(sql, params);
    return rows;
  } catch (err) {
    console.error('数据库查询错误:', err);
    throw err;
  } finally {
    if (connection) connection.release(); // 释放连接回连接池
  }
};

// 封装事务方法
const transaction = async (callback) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    console.error('事务执行错误:', err);
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  query,
  transaction,
  pool // 暴露原始pool用于特殊需求
};