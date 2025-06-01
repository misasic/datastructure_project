const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config.js');
const routes = require('./routes');
const db = require('./db');

const app = express();

// 配置CORS中间件
app.use(cors({
  origin: '*', // 允许任何域名访问
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));

// 中间件
app.use(bodyParser.json());

// 引入图片路由
const imagesRouter = require('./routes/images');
app.use('/api/images', imagesRouter);

// API路由
app.use('/api', routes);

// 测试数据库连接并初始化数据
(async () => {
  try {
    // 测试数据库连接
    console.log('正在连接数据库...');
    console.log('数据库配置:', {
      host: config.db.host,
      user: config.db.user,
      database: config.db.database,
      port: config.db.port
    });
    
    const rows = await db.query('SELECT 1 + 1 AS solution');
    console.log('数据库连接成功:', rows);
    
    // 初始化数据库表结构
    console.log('正在初始化数据库表结构...');
    const { initDatabase } = require('./init-db-func');
    await initDatabase(db);
    
    // 检查景点数据是否存在
    const scenicSpots = await db.query('SELECT COUNT(*) as count FROM scenic_spots');
    console.log(`当前景点数量: ${scenicSpots[0].count}`);
    
    // 如果没有景点数据，尝试初始化示例数据
    if (scenicSpots[0].count === 0) {
      console.log('未发现景点数据，尝试初始化示例数据...');
      
      // 引入并执行初始化示例数据的脚本
      try {
        // 这里直接执行初始化函数而不是通过require执行脚本
        // 防止db连接池被多次关闭
        const { initSampleData } = require('./init-data-func');
        await initSampleData(db);
        console.log('示例数据初始化成功!');
      } catch (initErr) {
        console.error('示例数据初始化失败:', initErr);
      }
    }
    
    // 检查景点分类
    const categories = await db.query('SELECT DISTINCT category FROM scenic_spots');
    console.log('景点分类:', categories.map(c => c.category));
    
    // 检查学校数据
    const schools = await db.query('SELECT COUNT(*) as count FROM schools');
    console.log(`当前学校数量: ${schools[0].count}`);
    
  } catch (err) {
    console.error('数据库连接或初始化失败:', err);
    console.error('错误详情:', err.message);
    console.error('请检查数据库配置和网络连接');
  }
})();

// 使用正确的服务器端口
app.listen(config.serverPort, '0.0.0.0', () => {
  console.log(`后端服务运行在 http://localhost:${config.serverPort}`);
  console.log(`外网可通过 http://服务器IP:${config.serverPort} 访问`);
});