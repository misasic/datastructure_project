const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db');

// 处理图片请求 - 返回默认占位符图片
router.get('/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  
  // 这里可以根据图片名称返回不同的颜色或样式
  // 现在返回一个简单的SVG占位符
  const colors = {
    'gugong': '#c41230',
    'changcheng': '#8b7355',
    'xihu': '#4a90e2',
    'huangshan': '#228b22',
    'yiheyuan': '#daa520',
    'zhangjiajie': '#2e8b57',
    'jiuzhaigou': '#00ced1',
    'bingmayong': '#cd853f',
    'guilin': '#20b2aa',
    'tiantan': '#4682b4',
    'beida': '#8b0000',
    'qinghua': '#6a0dad',
    'fudan': '#000080',
    'beiyou': '#008000',
    'wuda': '#ff69b4',
    'nanda': '#800080',
    'jiaoda': '#ff4500',
    'zheda': '#1e90ff',
    'renda': '#dc143c',
    'xiada': '#00bfff'
  };
  
  const baseName = imageName.replace('.jpg', '');
  const color = colors[baseName] || '#666666';
  const displayName = getDisplayName(baseName);
  
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="${color}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, Microsoft YaHei, sans-serif" 
            font-size="72" fill="white" opacity="0.8">
        ${displayName}
      </text>
    </svg>
  `;
  
  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'public, max-age=31536000'); // 缓存一年
  res.send(svg);
});

function getDisplayName(baseName) {
  const names = {
    'gugong': '故宫',
    'changcheng': '长城',
    'xihu': '西湖',
    'huangshan': '黄山',
    'yiheyuan': '颐和园',
    'zhangjiajie': '张家界',
    'jiuzhaigou': '九寨沟',
    'bingmayong': '兵马俑',
    'guilin': '桂林',
    'tiantan': '天坛',
    'beida': '北大',
    'qinghua': '清华',
    'fudan': '复旦',
    'beiyou': '北邮',
    'wuda': '武大',
    'nanda': '南大',
    'jiaoda': '交大',
    'zheda': '浙大',
    'renda': '人大',
    'xiada': '厦大'
  };
  
  return names[baseName] || '图片';
}

// 上传图片
router.post('/upload', async (req, res) => {
  try {
    console.log('收到上传请求:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      files: req.files
    });
    
    // 检查是否有文件上传
    if (!req.files || !req.files.image) {
      console.log('未找到上传的文件');
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片'
      });
    }

    const file = req.files.image;
    console.log('上传的文件信息:', {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      tempFilePath: file.tempFilePath
    });
    
    // 检查文件类型
    if (!file.mimetype.startsWith('image/')) {
      console.log('文件类型不正确:', file.mimetype);
      return res.status(400).json({
        success: false,
        message: '只能上传图片文件'
      });
    }

    // 检查文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      console.log('文件大小超出限制:', file.size);
      return res.status(400).json({
        success: false,
        message: '图片大小不能超过2MB'
      });
    }

    // 生成文件名
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    
    // 确保上传目录存在
    const uploadDir = path.join(__dirname, '../../public/uploads');
    console.log('上传目录:', uploadDir);
    
    if (!fs.existsSync(uploadDir)) {
      console.log('创建上传目录');
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 保存文件
    const filePath = path.join(uploadDir, fileName);
    console.log('保存文件到:', filePath);
    
    await file.mv(filePath);
    console.log('文件保存成功');

    // 返回文件URL
    const imageUrl = `/uploads/${fileName}`;
    console.log('生成的文件URL:', imageUrl);
    
    return res.json({
      success: true,
      message: '图片上传成功',
      data: {
        image_url: imageUrl
      }
    });
  } catch (err) {
    console.error('上传图片失败:', err);
    return res.status(500).json({
      success: false,
      message: '上传图片失败：' + err.message
    });
  }
});

// 删除图片
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    // 获取图片信息
    const [images] = await db.query(
      'SELECT * FROM diary_images WHERE id = ?',
      [id]
    );

    if (!images || images.length === 0) {
      return res.status(404).json({
        success: false,
        message: '图片不存在'
      });
    }

    const image = images[0];

    // 删除文件
    const filePath = path.join(__dirname, '../public', image.image_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 删除数据库记录
    await db.query(
      'DELETE FROM diary_images WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: '图片删除成功'
    });
  } catch (err) {
    console.error('删除图片失败:', err);
    res.status(500).json({
      success: false,
      message: '删除图片失败：' + err.message
    });
  }
});

module.exports = router; 