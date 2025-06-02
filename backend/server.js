// 导入必要的模块
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const config = require('./config');
const routes = require('./routes');
const imagesRouter = require('./routes/images');

// 创建Express应用实例
const app = express();

// 配置CORS中间件，允许跨域请求
// 这对于前后端分离的架构是必需的
app.use(cors({
  origin: 'http://localhost:8080', // 允许的前端域名
  credentials: true
}));

// 配置请求体解析中间件
// 用于解析JSON格式的请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 配置文件上传中间件
app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 }, // 限制文件大小为2MB
  abortOnLimit: true,
  responseOnLimit: '文件大小不能超过2MB',
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  createParentPath: true
}));

// 配置静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/animations', express.static(path.join(__dirname, '../public/animations')));
app.use('/image', express.static('/root/image')); // 添加服务器上的图片目录

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('请求头:', req.headers);
  console.log('请求体:', req.body);
  console.log('文件:', req.files);

  // 在响应结束时记录响应信息
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] 响应状态: ${res.statusCode}, 耗时: ${duration}ms`);
    console.log('响应体:', res.locals.responseBody || '无响应体');
  });

  // 保存响应体以便记录
  const oldJson = res.json;
  res.json = function(data) {
    res.locals.responseBody = data;
    return oldJson.call(this, data);
  };

  next();
});

// 注册路由 - 确保图片路由在其他路由之前注册
app.use('/api/images', imagesRouter);
app.use('/api', routes);

// 404 处理中间件
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use((err, req, res) => {
  console.error(`[${new Date().toISOString()}] 错误:`, err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
// 监听配置文件中指定的端口
app.listen(config.serverPort, () => {
  console.log(`服务器运行在 http://localhost:${config.serverPort}`);
});