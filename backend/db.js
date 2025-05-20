const mysql = require('mysql2/promise'); // 直接导入promise版本
const config = require('./config');

// 创建连接池
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true, // 启用命名参数
  decimalNumbers: true // 正确处理DECIMAL类型
});

// 封装查询方法
const query = async (sql, params) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows;
  } finally {
    connection.release(); // 释放连接回连接池
  }
};

// 封装事务方法
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  query,
  transaction,
  pool // 暴露原始pool用于特殊需求
};