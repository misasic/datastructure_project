const express = require('express');
const router = express.Router();

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

module.exports = router; 